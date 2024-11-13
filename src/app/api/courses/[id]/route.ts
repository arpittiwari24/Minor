import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET(req: Request, {params} : {params: {id: string}}) {
    const { id } = params;
    const course = await prisma.course.findUnique({
        where: { id }
    });
    const enrollment = await prisma.enrollment.findFirst({
        where: { courseId: id }
    });
    return NextResponse.json({ course, enrollment });
}