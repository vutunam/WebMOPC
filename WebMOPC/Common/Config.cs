using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace WebMOPC.Common
{
    public static class Config
    {
        public static int _environment = 0;     
        public static string Connection()
        {
            string conn = "";
            if (_environment == 0)
            {
                conn = @"server=NAM;database=MOPC;Persist Security Info=True;User ID=sa;Password=1;Encrypt=True;Trust Server Certificate=True";
            }
            else
            {
                conn = @"";
            }

            return conn;
        }
    }
}
