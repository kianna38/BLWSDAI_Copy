namespace BLWSDAI.Models.DTOs
{

    public class PaginatedResponse<T>
    {
        public IEnumerable<T> Data { get; set; } = new List<T>();
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    }



}
