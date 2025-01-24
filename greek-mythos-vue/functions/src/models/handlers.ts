import { Change, database, https, ParamsOf } from "firebase-functions/v2";

export type CallableHandler = (context: https.CallableRequest) => Promise<any>;
export type CreatedHandler<Ref extends string> = (event: database.DatabaseEvent<database.DataSnapshot, ParamsOf<Ref>>) => any | Promise<any>;
export type WrittenHandler<Ref extends string> = (event: database.DatabaseEvent<Change<database.DataSnapshot>, ParamsOf<Ref>>) => any | Promise<any>;
export type DeletedHandler<Ref extends string> = (event: database.DatabaseEvent<database.DataSnapshot, ParamsOf<Ref>>) => any | Promise<any>;