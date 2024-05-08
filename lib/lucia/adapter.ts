
import db from "@/db";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
const adapter = new PrismaAdapter(db.session, db.user);
export default adapter;
