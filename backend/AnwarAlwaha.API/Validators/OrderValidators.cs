using AnwarAlwaha.API.DTOs.Orders;
using FluentValidation;

namespace AnwarAlwaha.API.Validators;

public class CreateOrderDtoValidator : AbstractValidator<CreateOrderDto>
{
    public CreateOrderDtoValidator()
    {
        RuleFor(x => x.CustomerName)
            .NotEmpty().WithMessage("اسم العميل مطلوب.")
            .MaximumLength(100).WithMessage("اسم العميل يجب ألا يتجاوز 100 حرف.");

        RuleFor(x => x.CustomerPhone)
            .NotEmpty().WithMessage("رقم الجوال مطلوب.")
            .Matches(@"^05\d{8}$").WithMessage("رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام (مثال: 0512345678).");

        RuleFor(x => x.DeliveryMethod)
            .NotEmpty().WithMessage("طريقة الاستلام مطلوبة.")
            .Must(m => m == "branch" || m == "delivery")
            .WithMessage("طريقة الاستلام يجب أن تكون إما 'branch' (استلام من الفرع) أو 'delivery' (توصيل).");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("يجب إضافة منتج واحد على الأقل للطلب.");

        RuleForEach(x => x.Items).SetValidator(new CreateOrderItemDtoValidator());
    }
}

public class CreateOrderItemDtoValidator : AbstractValidator<CreateOrderItemDto>
{
    public CreateOrderItemDtoValidator()
    {
        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("معرّف المنتج مطلوب.");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("الكمية يجب أن تكون 1 على الأقل.");
    }
}
