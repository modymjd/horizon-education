import mysql from 'mysql2/promise'
export const pool=mysql.createPool({host:process.env.DB_HOST||'localhost',user:process.env.DB_USER||'root',password:process.env.DB_PASSWORD||'',database:process.env.DB_NAME||'horizon_education',waitForConnections:true,connectionLimit:10})
export async function query<T=any>(sql:string,params:any[]=[]){const [rows]=await pool.execute(sql,params);return rows as T[]}
