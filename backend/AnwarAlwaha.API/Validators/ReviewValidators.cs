using AnwarAlwaha.API.DTOs.Reviews;
using FluentValidation;

namespace AnwarAlwaha.API.Validators;

public class CreateReviewDtoValidator : AbstractValidator<CreateReviewDto>
{
    public CreateReviewDtoValidator()
    {
        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("معرّف المنتج مطلوب.");

        RuleFor(x => x.OrderCode)
            .NotEmpty().WithMessage("كود الطلب مطلوب لتسجيل التقييم.");

        RuleFor(x => x.CustomerName)
            .NotEmpty().WithMessage("اسم العميل مطلوب.")
            .MaximumLength(100).WithMessage("اسم العميل يجب ألا يتجاوز 100 حرف.");

        RuleFor(x => x.Rating)
            .InclusiveBetween(1, 5).WithMessage("التقييم يجب أن يكون بين 1 و 5 نجوم.");
    }
}
