import { FormikErrors } from "formik";

// https://github.com/typestack/class-validator/blob/master/src/validation/ValidationError.ts
class ValidationError {
  /**
   * Object that was validated.
   *
   * OPTIONAL - configurable via the ValidatorOptions.validationError.target option
   */
  target?: object;

  /**
   * Object's property that haven't pass validation.
   */
  property: string;

  /**
   * Value that haven't pass a validation.
   *
   * OPTIONAL - configurable via the ValidatorOptions.validationError.value option
   */
  value?: any;

  /**
   * Constraints that failed validation with error messages.
   */
  constraints?: any;

  /**
   * Contains all nested validation errors of the property.
   */
  children: ValidationError[];


  /*
   * A transient set of data passed through to the validation result for response mapping
   */
  contexts?: {
    [type: string]: any;
  };

  /**
   *
   * @param shouldDecorate decorate the message with ANSI formatter escape codes for better readability
   * @param hasParent true when the error is a child of an another one
   * @param parentPath path as string to the parent of this property
   */
  toString (shouldDecorate: boolean = false, hasParent: boolean = false, parentPath: string = ``): string {
    const boldStart = shouldDecorate ? `\x1b[1m` : ``;
    const boldEnd = shouldDecorate ? `\x1b[22m` : ``;
    const propConstraintFailed = (propertyName: string): string => ` - property ${boldStart}${parentPath}${propertyName}${boldEnd} has failed the following constraints: ${boldStart}${Object.keys(this.constraints).join(`, `)}${boldEnd} \n`;

    if (!hasParent) {
      return `An instance of ${boldStart}${this.target ? this.target.constructor.name : "an object"}${boldEnd} has failed the validation:\n${
        this.constraints ? propConstraintFailed(this.property) : ``
      }${this.children
        .map(childError => childError.toString(shouldDecorate, true, this.property))
        .join(``)}`;
    }
    // we format numbers as array indexes for better readability.
    const formattedProperty = Number.isInteger(+this.property) ? `[${this.property}]` : `${parentPath ? `.` : ``}${this.property}`;

    if (this.constraints) {
      return propConstraintFailed(formattedProperty);
    }
    return this.children
      .map(childError => childError.toString(shouldDecorate, true, `${parentPath}${formattedProperty}`))
      .join(``);
  }
}


/** Maps array of `ValidationError` with a `ValidationError.property` as index to an array of Formik error objects for use in forms */
export const mapArrayError = <ObjectType>(errors: ValidationError[]): FormikErrors<ObjectType>[] => {
  const formErrors: FormikErrors<ObjectType>[] = [];

  for (const error of errors) {
    // `class-validator` sets `error.property` to the index with a validation error in the original target array
    const index = parseInt(error.property, 10);
    if (Number.isNaN(index)) throw new Error(`Property ${error.property} is not a valid array index`);

    if (error.children.length > 0) formErrors[index] = mapErrors(error.children);
    else {
      // We know `error.constraints` exists because `error.children` is empty
      const constraints = error.constraints!;

      // `as any` - have to assume that property is not nested (which it should not be as `error.children` is empty)
      // Use first constraint that failed for simplicity
      formErrors[index] = constraints[Object.keys(constraints)[0]] as any;
    }
  }

  return formErrors;
};

/** Maps an array of `ValidationError` to a Formik error object for use in forms\
 * *NOTE: If a nested value (object, array or array of objects) has an error both on its children/elements and itself
 * (e. g. array is too short **AND** some elements have errors), only the nested errors will be mapped/returned*
 */
const mapErrors = <Schema>(errors: ValidationError[]): FormikErrors<Schema> => {
  const formErrors: FormikErrors<Schema> = {};

  for (const error of errors) {
    // Have to assume property is valid key
    const property = error.property as keyof Schema;

    if (error.children.length > 0) {
      // `as any` - TypeScript can not "calculate" the conditional types in `FormikErrors`,
      // but if you look at the typing, it will be a valid type (this is valid for both cases here and underneath)
      formErrors[property] = (Array.isArray(error.value) ? mapArrayError(error.children) : mapErrors(error.children)) as any;
    } else {
      // We know `error.constraints` exists because `error.children` is empty
      const constraints = error.constraints!;

      // `as any` - have to assume that property is not nested (which it should not be as `error.children` is empty)
      // Use first constraint that failed for simplicity
      formErrors[property] = constraints[Object.keys(constraints)[0]] as any;
    }
  }

  return formErrors;
};

export default mapErrors;
