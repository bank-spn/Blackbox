import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { InventoryItem } from '@/lib/types';

export async function GET() {
  try {
    const inventory = db.getInventory();
    return NextResponse.json(inventory);
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
    const newItem: InventoryItem = {
      ...data,
      id: Date.now().toString(),
      lastRestocked: new Date(data.lastRestocked),
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
    };
    
    const item = db.addInventoryItem(newItem);
    return NextResponse.json(item, { status: 201 });
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
    const item = db.updateInventoryItem(id, updates);
    
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(item);
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
    
    const success = db.deleteInventoryItem(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Item not found' },
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
