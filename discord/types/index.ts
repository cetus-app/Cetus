export type PropertiesOfType<Object, Type> = { [K in keyof Object]: Object[K] extends Type ? K : never }[keyof Object]
export * from "./roblox";
