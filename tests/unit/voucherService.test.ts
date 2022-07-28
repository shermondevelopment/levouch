import voucherRepository from "../../src/repositories/voucherRepository.js";
import voucherService from "../../src/services/voucherService.js";

import { jest } from "@jest/globals";

describe("voucherService test suite", () => {
  it("Should create voucher", async () => {
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return null;
      });

    jest
      .spyOn(voucherRepository, "createVoucher")
      .mockImplementationOnce((): any => {
        return {
          id: 1,
          code: "teste1",
          discount: 20,
          used: false
        };
      });
    await voucherService.createVoucher("teste1", 20);
    expect(voucherRepository.createVoucher).toHaveBeenCalled();
  });

  it("Should not create voucher", async () => {
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return {
          id: 1,
          code: "teste1",
          discount: 20,
          used: false
        };
      });

    const promise = voucherService.createVoucher("teste1", 20);

    expect(promise).rejects.toEqual({
      message: "Voucher already exist.",
      type: "conflict"
    });
  });

  it("Should apply voucher and return amount with discount", async () => {
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return {
          id: 1,
          code: "teste1",
          discount: 20,
          used: false
        };
      });

    jest
      .spyOn(voucherRepository, "useVoucher")
      .mockImplementationOnce((): any => {
        return {
          id: 1,
          code: "teste1",
          discount: 20,
          used: true
        };
      });

    const afterDiscount = await voucherService.applyVoucher("teste1", 200);

    expect(afterDiscount.amount).toBe(200);
    expect(afterDiscount.finalAmount).toBe(160);
    expect(afterDiscount.applied).toBe(true);
  });

  it("Should not apply if voucher does not exist.", () => {
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return null;
      });

    const promise = voucherService.applyVoucher("teste1", 20);

    expect(promise).rejects.toEqual({
      message: "Voucher does not exist.",
      type: "conflict"
    });
  });

  it("Should not apply if voucher has already been used.", async () => {
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return {
          id: 1,
          code: "teste1",
          discount: 20,
          used: true
        };
      });

    jest
      .spyOn(voucherRepository, "useVoucher")
      .mockImplementationOnce((): any => {});

    const afterDiscount = await voucherService.applyVoucher("teste1", 200);

    expect(afterDiscount.amount).toBe(200);
    expect(afterDiscount.finalAmount).toBe(200);
    expect(afterDiscount.applied).toBe(false);
  });

  it("Should not apply voucher if amount is lower than 100", async () => {
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return {
          id: 1,
          code: "teste1",
          discount: 20,
          used: false
        };
      });

    jest
      .spyOn(voucherRepository, "useVoucher")
      .mockImplementationOnce((): any => {});

    const afterDiscount = await voucherService.applyVoucher("teste1", 99);

    expect(afterDiscount.amount).toBe(99);
    expect(afterDiscount.finalAmount).toBe(99);
    expect(afterDiscount.applied).toBe(false);
  });
});