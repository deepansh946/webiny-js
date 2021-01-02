import { validation, ValidationError } from "../src";

describe("lte test", () => {
    it("should not get triggered if an empty value was set", async () => {
        await expect(validation.validate(null, "lte")).resolves.toBe(true);
    });

    it("should fail - numbers are not lower", async () => {
        await expect(validation.validate(13.1, "lte:13")).rejects.toThrow(ValidationError);
        await expect(validation.validate(100.0000001, "lte:100")).rejects.toThrow(ValidationError);
    });

    it("should pass - numbers are lower", async () => {
        await expect(validation.validate(2, "lte:11")).resolves.toBe(true);
        await expect(validation.validate(11.9899999999999, "lte:11.99")).resolves.toBe(true);
    });

    it("should pass - numbers are equal", async () => {
        await expect(validation.validate(12, "lte:12")).resolves.toBe(true);
        await expect(validation.validate(0.54, "lte:0.54")).resolves.toBe(true);
    });

    it("should pass - numbers are lower: 10,0", async () => {
        await expect(validation.validate(10, "lte:12")).resolves.toBe(true);
        await expect(validation.validate(0, "lte:0.54")).resolves.toBe(true);
    });
});
