// Database funkcije za Groomer Dashboard

import { supabase } from './supabase';
import type {
  GroomerProfile,
  GroomerBooking,
  GroomerAvailabilitySlot,
  GroomerReview,
  PortfolioImage,
  MonthlyEarnings,
} from './groomer-dashboard-types';

// ─── Groomer Profile ───────────────────────────────────────────────

export async function getGroomerProfile(userId: string): Promise<GroomerProfile | null> {
  try {
    const { data, error } = await supabase
      .from('groomers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data as GroomerProfile;
  } catch (err) {
    console.error('getGroomerProfile error:', err);
    return null;
  }
}

export async function updateGroomerProfile(
  groomerId: string,
  updates: Partial<GroomerProfile>
): Promise<GroomerProfile | null> {
  try {
    const { data, error } = await supabase
      .from('groomers')
      .update(updates)
      .eq('id', groomerId)
      .select()
      .single();

    if (error) throw error;
    return data as GroomerProfile;
  } catch (err) {
    console.error('updateGroomerProfile error:', err);
    return null;
  }
}

// ─── Bookings ─────────────────────────────────────────────────────

export async function getGroomerBookings(groomerId: string): Promise<GroomerBooking[]> {
  try {
    const { data, error } = await supabase
      .from('groomer_bookings')
      .select(`
        *,
        client:users!user_id(id, name, avatar_url, email, phone)
      `)
      .eq('groomer_id', groomerId)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      ...row,
      client: row.client
        ? {
            id: row.client.id,
            name: row.client.name,
            avatar_url: row.client.avatar_url,
            email: row.client.email,
            phone: row.client.phone,
          }
        : undefined,
    }));
  } catch (err) {
    console.error('getGroomerBookings error:', err);
    return [];
  }
}

export async function updateGroomerBookingStatus(
  bookingId: string,
  status: 'confirmed' | 'rejected' | 'completed'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('groomer_bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('updateGroomerBookingStatus error:', err);
    return false;
  }
}

// ─── Availability ─────────────────────────────────────────────────

export async function getGroomerAvailability(groomerId: string): Promise<GroomerAvailabilitySlot[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('groomer_availability')
      .select('*')
      .eq('groomer_id', groomerId)
      .gte('date', today)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getGroomerAvailability error:', err);
    return [];
  }
}

export async function addAvailabilitySlot(
  slot: Omit<GroomerAvailabilitySlot, 'id'>
): Promise<GroomerAvailabilitySlot | null> {
  try {
    const { data, error } = await supabase
      .from('groomer_availability')
      .insert(slot)
      .select()
      .single();

    if (error) throw error;
    return data as GroomerAvailabilitySlot;
  } catch (err) {
    console.error('addAvailabilitySlot error:', err);
    return null;
  }
}

export async function deleteAvailabilitySlot(slotId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('groomer_availability')
      .delete()
      .eq('id', slotId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deleteAvailabilitySlot error:', err);
    return false;
  }
}

export async function generateDefaultSlots(
  groomerId: string,
  days: number = 28
): Promise<number> {
  try {
    const slots: Omit<GroomerAvailabilitySlot, 'id'>[] = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const dateStr = date.toISOString().split('T')[0];
      
      // Add slots for 09:00-17:00 in 1-hour increments
      const timeSlots = [
        { start: '09:00', end: '10:00' },
        { start: '10:00', end: '11:00' },
        { start: '11:00', end: '12:00' },
        { start: '13:00', end: '14:00' },
        { start: '14:00', end: '15:00' },
        { start: '15:00', end: '16:00' },
        { start: '16:00', end: '17:00' },
      ];
      
      for (const timeSlot of timeSlots) {
        slots.push({
          groomer_id: groomerId,
          date: dateStr,
          start_time: timeSlot.start,
          end_time: timeSlot.end,
          slot_duration_minutes: 60,
          is_available: true,
        });
      }
    }

    // Insert in batches of 50
    const batchSize = 50;
    let inserted = 0;
    
    for (let i = 0; i < slots.length; i += batchSize) {
      const batch = slots.slice(i, i + batchSize);
      const { error } = await supabase
        .from('groomer_availability')
        .upsert(batch, { onConflict: 'groomer_id,date,start_time' });
      
      if (error) {
        console.error('Error inserting batch:', error);
      } else {
        inserted += batch.length;
      }
    }

    return inserted;
  } catch (err) {
    console.error('generateDefaultSlots error:', err);
    return 0;
  }
}

// ─── Reviews ──────────────────────────────────────────────────────

export async function getGroomerReviews(groomerId: string): Promise<GroomerReview[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:users!reviewer_id(name, avatar_url)
      `)
      .eq('reviewee_id', groomerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      ...row,
      reviewer: row.reviewer
        ? {
            name: row.reviewer.name,
            avatar_url: row.reviewer.avatar_url,
          }
        : undefined,
    }));
  } catch (err) {
    console.error('getGroomerReviews error:', err);
    return [];
  }
}

// ─── Portfolio ────────────────────────────────────────────────────

export async function getGroomerPortfolio(groomerId: string): Promise<PortfolioImage[]> {
  try {
    const { data, error } = await supabase
      .from('groomer_portfolio')
      .select('*')
      .eq('groomer_id', groomerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getGroomerPortfolio error:', err);
    return [];
  }
}

export async function addPortfolioImage(
  image: Omit<PortfolioImage, 'id' | 'created_at'>
): Promise<PortfolioImage | null> {
  try {
    const { data, error } = await supabase
      .from('groomer_portfolio')
      .insert(image)
      .select()
      .single();

    if (error) throw error;
    return data as PortfolioImage;
  } catch (err) {
    console.error('addPortfolioImage error:', err);
    return null;
  }
}

export async function deletePortfolioImage(imageId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('groomer_portfolio')
      .delete()
      .eq('id', imageId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deletePortfolioImage error:', err);
    return false;
  }
}

// ─── Earnings ─────────────────────────────────────────────────────

export async function getGroomerEarnings(groomerId: string): Promise<{
  totalEarnings: number;
  thisMonthEarnings: number;
  monthlyEarnings: MonthlyEarnings[];
  completedBookings: GroomerBooking[];
}> {
  try {
    const { data, error } = await supabase
      .from('groomer_bookings')
      .select(`
        *,
        client:users!user_id(id, name, avatar_url, email, phone)
      `)
      .eq('groomer_id', groomerId)
      .eq('status', 'completed');

    if (error) throw error;

    const completedBookings = (data || []).map((row: any) => ({
      ...row,
      client: row.client
        ? {
            id: row.client.id,
            name: row.client.name,
            avatar_url: row.client.avatar_url,
            email: row.client.email,
            phone: row.client.phone,
          }
        : undefined,
    })) as GroomerBooking[];

    const totalEarnings = completedBookings.reduce((sum, b) => sum + b.price, 0);

    const now = new Date();
    const thisMonthEarnings = completedBookings
      .filter((b) => {
        const bd = new Date(b.date);
        return bd.getMonth() === now.getMonth() && bd.getFullYear() === now.getFullYear();
      })
      .reduce((sum, b) => sum + b.price, 0);

    // Monthly earnings for last 6 months
    const monthlyEarnings: MonthlyEarnings[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toLocaleDateString('hr-HR', { month: 'short' });
      const monthBookings = completedBookings.filter((b) => {
        const bd = new Date(b.date);
        return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
      });
      const amount = monthBookings.reduce((sum, b) => sum + b.price, 0);
      monthlyEarnings.push({
        month: monthStr,
        amount,
        bookingCount: monthBookings.length,
      });
    }

    return {
      totalEarnings,
      thisMonthEarnings,
      monthlyEarnings,
      completedBookings,
    };
  } catch (err) {
    console.error('getGroomerEarnings error:', err);
    return {
      totalEarnings: 0,
      thisMonthEarnings: 0,
      monthlyEarnings: [],
      completedBookings: [],
    };
  }
}

// ─── Messages ─────────────────────────────────────────────────────

export async function getUnreadMessagesCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error('getUnreadMessagesCount error:', err);
    return 0;
  }
}
