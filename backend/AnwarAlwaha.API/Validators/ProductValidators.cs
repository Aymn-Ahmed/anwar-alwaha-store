using AnwarAlwaha.API.DTOs.Products;
using FluentValidation;

namespace AnwarAlwaha.API.Validators;

public class ProductCreateUpdateDtoValidator : AbstractValidator<ProductCreateUpdateDto>
{
    public ProductCreateUpdateDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("اسم المنتج مطلوب.")
            .MaximumLength(200).WithMessage("اسم المنتج يجب ألا يتجاوز 200 حرف.");

        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("معرّف القسم مطلوب.");

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0).WithMessage("سعر المنتج لا يمكن أن يكون سالباً.");

        RuleFor(x => x.StockQuantity)
            .GreaterThanOrEqualTo(0).WithMessage("كمية المخزون لا يمكن أن تكون سالبة.");
    }
}
