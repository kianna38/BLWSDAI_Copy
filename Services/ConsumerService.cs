using BLWSDAI.Data;
using BLWSDAI.Models;
using BLWSDAI.Models.DTOs;
using BLWSDAI.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BLWSDAI.Services
{
    public class ConsumerService : IConsumerService
    {
        private readonly ApplicationDbContext _context;

        public ConsumerService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PaginatedResponse<ConsumerReadDto>> GetAllAsync(int page = 1, int pageSize = 20)
        {
            var query = _context.Consumers;
            var totalCount = await query.CountAsync();

            var consumers = await query
                .OrderBy(c => c.ConsumerId)
                .ToListAsync();

            return new PaginatedResponse<ConsumerReadDto>
            {
                Data = consumers.Select(c => new ConsumerReadDto
                {
                    ConsumerId = c.ConsumerId,
                    FirstName = c.FirstName,
                    LastName = c.LastName,
                    MiddleInitial = c.MiddleInitial,
                    MeterNumber = c.MeterNumber,
                    PhoneNumber = c.PhoneNumber,
                    Email = c.Email,
                    Purok = c.Purok,
                    Status = c.Status,
                    NotifPreference = c.NotifPreference,
                    CreatedAt = c.CreatedAt,
                }).ToList(),
                CurrentPage = 1,
                PageSize = totalCount,
                TotalCount = totalCount
            };
        }


        public async Task<PaginatedResponse<ConsumerReadDto>> FilterAsync(ConsumerFilterDto filter)
        {
            if (filter.Page < 1) filter.Page = 1;
            if (filter.PageSize < 1) filter.PageSize = 500;

            var query = _context.Consumers.AsQueryable();

            if (filter.Puroks?.Any() == true)
                query = query.Where(c => filter.Puroks.Contains(c.Purok));
            if (filter.Statuses?.Any() == true)
                query = query.Where(c => filter.Statuses.Contains(c.Status));
            if (filter.NotifPreferences?.Any() == true)
                query = query.Where(c => filter.NotifPreferences.Contains(c.NotifPreference));

            var totalCount = await query.CountAsync();

            bool desc = filter.SortDir.ToLower() == "desc";
            query = filter.SortBy?.ToLower() switch
            {
                "lastname" => desc ? query.OrderByDescending(c => c.LastName) : query.OrderBy(c => c.LastName),
                "purok" => desc ? query.OrderByDescending(c => c.Purok) : query.OrderBy(c => c.Purok),
                "createdat" => desc ? query.OrderByDescending(c => c.CreatedAt) : query.OrderBy(c => c.CreatedAt),
                _ => query.OrderBy(c => c.ConsumerId)
            };

            var paged = await query
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new PaginatedResponse<ConsumerReadDto>
            {
                Data = paged.Select(c => new ConsumerReadDto
                {
                    ConsumerId = c.ConsumerId,
                    FirstName = c.FirstName,
                    LastName = c.LastName,
                    MiddleInitial = c.MiddleInitial,
                    MeterNumber = c.MeterNumber,
                    PhoneNumber = c.PhoneNumber,
                    Email = c.Email,
                    Purok = c.Purok,
                    Status = c.Status,
                    NotifPreference = c.NotifPreference,
                    CreatedAt = c.CreatedAt
                }).ToList(),
                CurrentPage = filter.Page,
                PageSize = filter.PageSize,
                TotalCount = totalCount
            };
        }





        public async Task<ConsumerReadDto?> GetByIdAsync(int id)
        {
            var c = await _context.Consumers.FindAsync(id);
            if (c == null) return null;

            return new ConsumerReadDto
            {
                ConsumerId = c.ConsumerId,
                FirstName = c.FirstName,
                LastName = c.LastName,
                MiddleInitial = c.MiddleInitial,
                MeterNumber = c.MeterNumber,
                PhoneNumber = c.PhoneNumber,
                Email = c.Email,
                Purok = c.Purok,
                Status = c.Status,
                NotifPreference = c.NotifPreference,
                CreatedAt = c.CreatedAt
            };
        }


        public async Task<ConsumerReadDto> CreateAsync(ConsumerCreateUpdateDto dto)

        {
            var c = new Consumer
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                MiddleInitial = dto.MiddleInitial,
                MeterNumber = dto.MeterNumber,
                PhoneNumber = dto.PhoneNumber,
                Email = dto.Email,
                Purok = dto.Purok,
                Status = dto.Status,
                NotifPreference = dto.NotifPreference,
                CreatedAt = DateTime.UtcNow,
            };

            _context.Consumers.Add(c);
            await _context.SaveChangesAsync();

            // Return the created consumer as a ConsumerReadDto
            return new ConsumerReadDto
            {
                ConsumerId = c.ConsumerId,
                FirstName = c.FirstName,
                LastName = c.LastName,
                MiddleInitial = c.MiddleInitial,
                MeterNumber = c.MeterNumber,
                PhoneNumber = c.PhoneNumber,
                Email = c.Email,
                Purok = c.Purok,
                Status = c.Status,
                NotifPreference = c.NotifPreference,
                CreatedAt = c.CreatedAt
            };
        }



        public async Task<bool> UpdateAsync(int id, ConsumerCreateUpdateDto dto)
        {
            var c = await _context.Consumers.FindAsync(id);
            if (c == null) return false;

            c.FirstName = dto.FirstName;
            c.LastName = dto.LastName;
            c.MiddleInitial = dto.MiddleInitial;
            c.MeterNumber = dto.MeterNumber;
            c.PhoneNumber = dto.PhoneNumber;
            c.Email = dto.Email;
            c.Purok = dto.Purok;
            c.Status = dto.Status;
            c.NotifPreference = dto.NotifPreference;

            _context.Consumers.Update(c);

            // If the status is Disconnected or Cut
            if (c.Status == ConsumerStatusEnum.Disconnected || c.Status == ConsumerStatusEnum.Cut)
            {
                var currentYear = DateTime.UtcNow.Year;
                var currentMonth = DateTime.UtcNow.Month;

                var readingToDelete = await _context.Readings
                    .FirstOrDefaultAsync(r => r.ConsumerId == c.ConsumerId &&
                                              r.MonthYear.Year == currentYear &&
                                              r.MonthYear.Month == currentMonth);

                if (readingToDelete != null)
                {
                    _context.Readings.Remove(readingToDelete);
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<bool> DeleteAsync(int id)
        {
            var consumer = await _context.Consumers
                .Include(c => c.Readings)  // Include associated readings
                .FirstOrDefaultAsync(c => c.ConsumerId == id);

            if (consumer == null) return false;

            // Check if the consumer has any associated readings
            if (consumer.Readings.Any())
            {
                // If there are readings associated with the consumer, return false (cannot delete)
                return false;
            }

            // Hard delete the consumer
            _context.Consumers.Remove(consumer);

            // Save the changes to the database
            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<PaginatedResponse<ConsumerBillPaymentDto>> GetConsumerBillPaymentDataAsync(ConsumerBillPaymentFilterDto filter)
        {
            var query = _context.Bills
                .Include(b => b.Consumer)
                .Include(b => b.Reading)
                .Include(b => b.Payments)
                .AsQueryable();

            // If consumerId is provided, filter by it
            if (filter.ConsumerId > 0)
            {
                query = query.Where(b => b.ConsumerId == filter.ConsumerId);
            }

            // If monthYear is provided, filter by the year and month (ignoring the day)
            if (filter.MonthYear.HasValue)
            {
                var monthYear = filter.MonthYear.Value;

                // Ensure we compare only the Year and Month
                query = query.Where(b => b.MonthYear.Year == monthYear.Year && b.MonthYear.Month == monthYear.Month);
            }

            // If status is provided, filter by the status
            if (!string.IsNullOrEmpty(filter.Status))
            {
                query = query.Where(b => b.Status.ToString() == filter.Status);
            }

            // If paymentType is provided, filter by the payment type
            if (!string.IsNullOrEmpty(filter.PaymentType))
            {
                query = query.Where(b => b.Payments.Any(p => p.PaymentType.ToString() == filter.PaymentType));
            }

            // Sorting logic for sorting by LastName, TotalAmount, and CubicUsed
            if (!string.IsNullOrEmpty(filter.SortBy))
            {
                switch (filter.SortBy.ToLower())
                {
                    case "lastname":
                        query = filter.SortDir.ToLower() == "desc"
                            ? query.OrderByDescending(b => b.Consumer.LastName)
                            : query.OrderBy(b => b.Consumer.LastName);
                        break;

                    case "totalamount":
                        query = filter.SortDir.ToLower() == "desc"
                            ? query.OrderByDescending(b => b.TotalAmount)
                            : query.OrderBy(b => b.TotalAmount);
                        break;

                    case "cubicused":
                        query = filter.SortDir.ToLower() == "desc"
                            ? query.OrderByDescending(b => b.Reading.CubicUsed)
                            : query.OrderBy(b => b.Reading.CubicUsed);
                        break;

                    default:
                        query = query.OrderByDescending(b => b.MonthYear); // Default sorting by newest month
                        break;
                }
            }
            else
            {
                query = query.OrderByDescending(b => b.MonthYear); // Default sorting if no SortBy is specified
            }

            // Pagination
            var totalCount = await query.CountAsync();
            var pagedBills = await query
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            // Creating the response DTO list
            var result = pagedBills.Select(bill => new ConsumerBillPaymentDto
            {
                ConsumerId = bill.ConsumerId,
                ReadingId = bill.Reading.ReadingId ,  // Assuming first reading
                BillId = bill.BillId,
                PaymentId = bill.Payments.FirstOrDefault()?.PaymentId ?? 0,  // Assuming first payment
                FirstName = bill.Consumer.FirstName,
                LastName = bill.Consumer.LastName,
                Purok = bill.Consumer.Purok.ToString(),  // Assuming PurokEnum has a ToString method
                MonthYear = bill.MonthYear,
                CubicUsed = bill.Reading.CubicUsed ,
                TotalAmount = bill.TotalAmount,
                Balance = bill.Balance,
                Subsidy = bill.Subsidy,
                SystemLoss = bill.SystemLoss,
                Status = bill.Status.ToString(),
                PaymentDate = bill.Payments.FirstOrDefault()?.PaymentDate,
                Penalty = bill.Payments.FirstOrDefault()?.Penalty ?? 0,
                PaymentType = bill.Payments.FirstOrDefault()?.PaymentType.ToString(),
                AmountPaid = bill.Payments.FirstOrDefault()?.AmountPaid ?? 0,
                NotifStatus = bill.NotifStatus.ToString(),
            }).ToList();

            return new PaginatedResponse<ConsumerBillPaymentDto>
            {
                Data = result,
                CurrentPage = filter.Page,
                PageSize = filter.PageSize,
                TotalCount = totalCount
            };
        }





    }
}

