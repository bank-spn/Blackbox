import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Staff } from '@/lib/types';

export async function GET() {
  try {
    const staff = db.getStaff();
    return NextResponse.json(staff);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const newStaff: Staff = {
      ...data,
      id: Date.now().toString(),
      hireDate: new Date(data.hireDate),
    };
    
    const staff = db.addStaff(newStaff);
    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    const staff = db.updateStaff(id, updates);
    
    if (!staff) {
      return NextResponse.json(
        { error: 'Staff not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(staff);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }
    
    const success = db.deleteStaff(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Staff not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
