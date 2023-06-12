export default class Config {
    private static readonly envVars = ["STAGE", "TABLENAME"];

    public static stage = process.env.STAGE ?? "local";
    public static tableName = process.env.TABLENAME ?? "";   
}