import { IsString, Length } from "class-validator";
import {
  Authorized, Body, Delete, Get, JsonController, NotFoundError, Param, Post
} from "routing-controllers";
import { ResponseSchema } from "routing-controllers-openapi";

class Item {
  @IsString()
  @Length(4, 20)
  name: string;
}

const items: Item[] = [
  { name: "item1" },
  { name: "item2" }
];

@JsonController("/sample")
export default class SampleController {
  @Get("/")
  // Required for `routing-controllers-openapi`
  @ResponseSchema(Item, { isArray: true })
  getAll (): Item[] {
    return items;
  }

  @Get("/:name")
  @ResponseSchema(Item)
  getOne (@Param("name") name: string): Item | undefined {
    return items.find(item => item.name === name);
  }

  @Post("/")
  @ResponseSchema(Item)
  @Authorized()
  create (@Body() item: Item): Item {
    items.push(item);

    return item;
  }

  @Delete("/:name")
  @ResponseSchema(Item)
  @Authorized()
  delete (@Param("name") name: string): Item {
    const index = items.findIndex(item => item.name === name);

    if (index < 0) throw new NotFoundError(`Item with name ${name} not found`);

    return items.splice(index, 1)[0];
  }
}
