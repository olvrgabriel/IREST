using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IREST.API.Data;
using IREST.API.Models;
using IREST.API.DTOs;
using IREST.API.Extensions;

namespace IREST.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReviewsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Reviews - Publico (com paginacao)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetReviews(int page = 1, int pageSize = 50, int? funerariaId = null)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize is < 1 or > 200 ? 50 : pageSize;

            IQueryable<Review> query = _context.Reviews
                .Include(r => r.Usuario)
                .Include(r => r.Funeraria)
                .Include(r => r.Admin);

            if (funerariaId.HasValue)
                query = query.Where(r => r.FunerariaId == funerariaId.Value);

            var reviews = await query
                .OrderByDescending(r => r.DataAvaliacao)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return reviews.Select(r => r.ToDto()!).ToList();
        }

        // GET: api/Reviews/5 - Publico
        [HttpGet("{id}")]
        public async Task<ActionResult<ReviewDto>> GetReview(int id)
        {
            var review = await _context.Reviews
                .Include(r => r.Usuario)
                .Include(r => r.Funeraria)
                .Include(r => r.Admin)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (review == null)
            {
                return NotFound();
            }

            return review.ToDto()!;
        }

        // PUT: api/Reviews/5 - Admin (moderacao) ou autor da review
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> PutReview(int id, Review review)
        {
            var existing = await _context.Reviews.FindAsync(id);
            if (existing == null)
            {
                return NotFound();
            }

            var isAdmin = User.IsAdmin();
            if (!isAdmin && existing.UsuarioId != User.GetUserId())
            {
                return Forbid();
            }

            if (review.Nota < 1 || review.Nota > 5)
            {
                return BadRequest(new { message = "Nota deve ser entre 1 e 5" });
            }

            existing.Nota = review.Nota;
            existing.Comentario = review.Comentario;

            // Somente admin pode reatribuir dono ou adicionar flag de admin
            if (isAdmin)
            {
                existing.UsuarioId = review.UsuarioId;
                existing.FunerariaId = review.FunerariaId;
                existing.AdminId = review.AdminId;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ReviewExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Reviews - Somente usuario autenticado
        [HttpPost]
        [Authorize(Roles = "usuario")]
        public async Task<ActionResult<ReviewDto>> PostReview(Review review)
        {
            var uid = User.GetUserId();
            if (uid == null) return Forbid();

            if (review.Nota < 1 || review.Nota > 5)
            {
                return BadRequest(new { message = "Nota deve ser entre 1 e 5" });
            }

            if (review.FunerariaId <= 0 ||
                !await _context.Funerarias.AnyAsync(f => f.Id == review.FunerariaId))
            {
                return BadRequest(new { message = "Funeraria invalida" });
            }

            // Ignora quaisquer ids vindos do cliente
            review.UsuarioId = uid.Value;
            review.AdminId = null;
            review.DataAvaliacao = DateTime.Now;

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            var created = await _context.Reviews
                .Include(r => r.Usuario)
                .Include(r => r.Funeraria)
                .Include(r => r.Admin)
                .FirstOrDefaultAsync(r => r.Id == review.Id);

            return CreatedAtAction("GetReview", new { id = review.Id }, created!.ToDto());
        }

        // DELETE: api/Reviews/5 - Admin ou autor da review
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin,usuario")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
            {
                return NotFound();
            }

            if (!User.IsAdmin() && review.UsuarioId != User.GetUserId())
            {
                return Forbid();
            }

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ReviewExists(int id)
        {
            return _context.Reviews.Any(e => e.Id == id);
        }
    }
}
