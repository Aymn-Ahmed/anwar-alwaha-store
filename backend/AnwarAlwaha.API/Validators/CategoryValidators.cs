using AnwarAlwaha.API.DTOs.Categories;
using FluentValidation;

namespace AnwarAlwaha.API.Validators;

public class CategoryCreateUpdateDtoValidator : AbstractValidator<CategoryCreateUpdateDto>
{
    public CategoryCreateUpdateDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("اسم القسم مطلوب.")
            .MaximumLength(150).WithMessage("اسم القسم يجب ألا يتجاوز 150 حرف.");
    }
}
