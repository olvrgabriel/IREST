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

        // GET: api/Reviews - Publico
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetReviews()
        {
            var reviews = await _context.Reviews
                .Include(r => r.Usuario)
                .Include(r => r.Funeraria)
                .Include(r => r.Admin)
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

        // PUT: api/Reviews/5 - Somente admin (moderacao)
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> PutReview(int id, Review review)
        {
            var existing = await _context.Reviews.FindAsync(id);
            if (existing == null)
            {
                return NotFound();
            }

            existing.Nota = review.Nota;
            existing.Comentario = review.Comentario;
            existing.UsuarioId = review.UsuarioId;
            existing.FunerariaId = review.FunerariaId;
            existing.AdminId = review.AdminId;

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
            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            var created = await _context.Reviews
                .Include(r => r.Usuario)
                .Include(r => r.Funeraria)
                .Include(r => r.Admin)
                .FirstOrDefaultAsync(r => r.Id == review.Id);

            return CreatedAtAction("GetReview", new { id = review.Id }, created!.ToDto());
        }

        // DELETE: api/Reviews/5 - Admin ou usuario
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin,usuario")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
            {
                return NotFound();
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
