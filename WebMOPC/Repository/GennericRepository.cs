using Microsoft.EntityFrameworkCore;
using WebMOPC.IReposiory;
using WebMOPC.Models;
using WebMOPC.Models.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
namespace WebMOPC.Repository
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        protected MopcContext db { get; set; }
        protected DbSet<T> table = null;

        public GenericRepository()
        {
            db = new MopcContext();
            table = db.Set<T>();
        }

        public GenericRepository(MopcContext db)
        {
            this.db = db;
            table = db.Set<T>();
        }

        public IEnumerable<T> GetAll()
        {
            return table.ToList();
        }

        public T GetByID(int id)
        {
            return table.Find(id);
        }

        public int Create(T item)
        {
            table.Add(item);
            return db.SaveChanges();
        }

        public int Update(T item)
        {
            table.Attach(item);
            db.Entry(item).State = EntityState.Modified;
            return db.SaveChanges();
        }

        public int Delete(int id)
        {
            table.Remove(table.Find(id));
            return db.SaveChanges();
        }

        public int Delete(List<T> item)
        {
            table.RemoveRange(item);
            return db.SaveChanges();

        }

        public int Confirm(T[] item)
        {
            for (int i = 0; i < item.Length; i++)
            {
                table.Attach(item[i]);
                db.Entry(item[i]).State = EntityState.Modified;
            }
            return db.SaveChanges();
        }

        public async Task<int> CreateAsync(T item)
        {
            table.Add(item);
            return await db.SaveChangesAsync();
        }

        public async Task<int> UpdateAsync(T item)
        {
            table.Attach(item);
            db.Entry(item).State = EntityState.Modified;
            return await db.SaveChangesAsync();
        }

        public async Task<int> DeleteAsync(int id)
        {
            table.Remove(table.Find(id));
            return await db.SaveChangesAsync();
        }

        public int RemoveRange(IEnumerable<T> items)
        {
            table.RemoveRange(items);
            return db.SaveChanges();
        }

        public int CreateRange(List<T> items)
        {
            table.AddRange(items);
            return db.SaveChanges();
        }
    }
}
