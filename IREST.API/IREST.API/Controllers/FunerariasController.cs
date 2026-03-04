using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IREST.API.Data;
using IREST.API.Models;

namespace IREST.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FunerariasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FunerariasController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Funerarias
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Funeraria>>> GetFunerarias()
        {
            return await _context.Funerarias.ToListAsync();
        }

        // GET: api/Funerarias/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Funeraria>> GetFuneraria(int id)
        {
            var funeraria = await _context.Funerarias.FindAsync(id);

            if (funeraria == null)
            {
                return NotFound();
            }

            return funeraria;
        }

        // PUT: api/Funerarias/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutFuneraria(int id, Funeraria funeraria)
        {
            if (id != funeraria.Id)
            {
                return BadRequest();
            }

            _context.Entry(funeraria).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FunerariaExists(id))
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

        // POST: api/Funerarias
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Funeraria>> PostFuneraria(Funeraria funeraria)
        {
            _context.Funerarias.Add(funeraria);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetFuneraria", new { id = funeraria.Id }, funeraria);
        }

        // DELETE: api/Funerarias/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFuneraria(int id)
        {
            var funeraria = await _context.Funerarias.FindAsync(id);
            if (funeraria == null)
            {
                return NotFound();
            }

            _context.Funerarias.Remove(funeraria);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool FunerariaExists(int id)
        {
            return _context.Funerarias.Any(e => e.Id == id);
        }
    }
}
