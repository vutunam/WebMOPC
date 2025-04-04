
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebMOPC.IReposiory
{
	public interface IGenericRepository<T> where T : class
	{
		IEnumerable<T> GetAll();
		T GetByID(int id);
		int Create(T item);
		int Update(T item);
		int Delete(int id);
		int Confirm(T[] item);
		int CreateRange(List<T> items);
		int RemoveRange(IEnumerable<T> items);
	}
}