using AnwarAlwaha.API.DTOs.Payments;
using FluentValidation;

namespace AnwarAlwaha.API.Validators;

public class InitiatePaymentRequestDtoValidator : AbstractValidator<InitiatePaymentRequestDto>
{
    public InitiatePaymentRequestDtoValidator()
    {
        RuleFor(x => x)
            .Must(x => x.OrderId.HasValue || !string.IsNullOrWhiteSpace(x.OrderCode))
            .WithMessage("يجب تزويد معرّف الطلب (OrderId) أو رمز الطلب (OrderCode) لبدء عملية الدفع.");
    }
}
