import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// /pages/api/progress.ts
export async function PATCH(req: Request , {params} : {params: {id: string}}) {
    const { progress } = await req.json();
  
    try {
      const enrollment = await prisma.enrollment.update({
        where: { id: params.id },
        data: {
          progress: progress,
        },
      });
      return NextResponse.json({ enrollment }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Error updating progress" }, { status : 500 });
    }
  }
  