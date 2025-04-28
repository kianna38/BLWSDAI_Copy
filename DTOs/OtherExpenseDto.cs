using BLWSDAI.Models;

namespace BLWSDAI.Models.DTOs
{

    public class OtherExpenseCreateUpdateDto
    {
        public string Label { get; set; } = null!;
        public decimal Amount { get; set; }
        public DateTime Date { get; set; } 
        public int? UserId { get; set; }
    }


    public class OtherExpenseReadDto
    {
        public int ExpenseId { get; set; }
        public string Label { get; set; } = null!;
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public int? UserId { get; set; }
    }

    public class OtherExpenseFilterRequestDto
    {
        public DateTime? StartDate { get; set; } 
        public DateTime? EndDate { get; set; } 
        public string? Label { get; set; }
        public int? UserId { get; set; }

        public string? SortBy { get; set; } = "created_at:desc";
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }





}
