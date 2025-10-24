import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { recordVisit, getVisitorStats, getMostVisited } from '../../../controllers/visitorController.js';

// GET - Get visitor stats for a paper or most visited papers
export async function GET(request) {
    try {
        await connectToDatabase();
        
        const { searchParams } = new URL(request.url);
        const paperId = searchParams.get('paperId');
        const paperType = searchParams.get('paperType') || 'local';
        const action = searchParams.get('action');
        const limit = parseInt(searchParams.get('limit') || '10');

        if (action === 'most-visited') {
            const mostVisited = await getMostVisited(limit, paperType === 'all' ? null : paperType);
            return NextResponse.json({
                success: true,
                data: mostVisited
            });
        }

        if (!paperId) {
            return NextResponse.json({
                success: false,
                message: 'Paper ID is required'
            }, { status: 400 });
        }

        const stats = await getVisitorStats(paperId, paperType);
        
        return NextResponse.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error in visitor GET:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error'
        }, { status: 500 });
    }
}

// POST - Record a visit
export async function POST(request) {
    try {
        await connectToDatabase();
        
        const body = await request.json();
        const { paperId, paperType = 'local' } = body;

        console.log('Recording visit for:', { paperId, paperType });

        if (!paperId) {
            console.error('Missing paperId in request body:', body);
            return NextResponse.json({
                success: false,
                message: 'Paper ID is required'
            }, { status: 400 });
        }

        // Get visitor identifier (could be enhanced with IP tracking)
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'anonymous';
        
        console.log('Visitor IP:', ip);
        
        const visitor = await recordVisit(paperId, paperType, ip);
        
        console.log('Visit recorded successfully for paperId:', paperId);
        
        return NextResponse.json({
            success: true,
            data: {
                totalVisits: visitor.visitCount,
                uniqueVisitors: visitor.uniqueVisitors.length
            }
        });
    } catch (error) {
        console.error('Error in visitor POST:', error.message);
        console.error('Error stack:', error.stack);
        return NextResponse.json({
            success: false,
            message: `Failed to record visit: ${error.message}`
        }, { status: 500 });
    }
}
