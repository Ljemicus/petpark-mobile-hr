// Database funkcije za Trainer Dashboard

import { supabase } from './supabase';
import type {
  TrainerProfile,
  TrainerBooking,
  TrainerAvailabilitySlot,
  TrainingProgram,
  TrainerReview,
  MonthlyEarnings,
} from './trainer-dashboard-types';

// ─── Trainer Profile ───────────────────────────────────────────────

export async function getTrainerProfile(userId: string): Promise<TrainerProfile | null> {
  try {
    const { data, error } = await supabase
      .from('trainers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data as TrainerProfile;
  } catch (err) {
    console.error('getTrainerProfile error:', err);
    return null;
  }
}

export async function updateTrainerProfile(
  trainerId: string,
  updates: Partial<TrainerProfile>
): Promise<TrainerProfile | null> {
  try {
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined && value !== null)
    );
    const { data, error } = await supabase
      .from('trainers')
      .update(cleanUpdates)
      .eq('id', trainerId)
      .select()
      .single();

    if (error) throw error;
    return data as TrainerProfile;
  } catch (err) {
    console.error('updateTrainerProfile error:', err);
    return null;
  }
}

// ─── Bookings ─────────────────────────────────────────────────────

export async function getTrainerBookings(trainerId: string): Promise<TrainerBooking[]> {
  try {
    const { data, error } = await supabase
      .from('trainer_bookings')
      .select(`
        *,
        program:training_programs(id, name, type, duration_weeks, sessions, price)
      `)
      .eq('trainer_id', trainerId)
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
      program: row.program || undefined,
    }));
  } catch (err) {
    console.error('getTrainerBookings error:', err);
    return [];
  }
}

export async function updateTrainerBookingStatus(
  bookingId: string,
  status: 'confirmed' | 'rejected' | 'completed' | 'cancelled'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('trainer_bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('updateTrainerBookingStatus error:', err);
    return false;
  }
}

// ─── Availability ─────────────────────────────────────────────────

export async function getTrainerAvailability(trainerId: string): Promise<TrainerAvailabilitySlot[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('trainer_availability')
      .select('*')
      .eq('trainer_id', trainerId)
      .gte('date', today)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('getTrainerAvailability error:', err);
    return [];
  }
}

export async function addTrainerAvailabilitySlot(
  slot: Omit<TrainerAvailabilitySlot, 'id'>
): Promise<TrainerAvailabilitySlot | null> {
  try {
    const { data, error } = await supabase
      .from('trainer_availability')
      .insert(slot)
      .select()
      .single();

    if (error) throw error;
    return data as TrainerAvailabilitySlot;
  } catch (err) {
    console.error('addTrainerAvailabilitySlot error:', err);
    return null;
  }
}

export async function deleteTrainerAvailabilitySlot(slotId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('trainer_availability')
      .delete()
      .eq('id', slotId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deleteTrainerAvailabilitySlot error:', err);
    return false;
  }
}

export async function deleteTrainerAvailabilityByDay(
  trainerId: string,
  date: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('trainer_availability')
      .delete()
      .eq('trainer_id', trainerId)
      .eq('date', date);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deleteTrainerAvailabilityByDay error:', err);
    return false;
  }
}

export async function generateTrainerSlots(
  trainerId: string,
  workDays: number[],
  workStart: string,
  workEnd: string,
  days: number = 28
): Promise<number> {
  try {
    const slots: Omit<TrainerAvailabilitySlot, 'id'>[] = [];
    const today = new Date();
    
    const startHour = parseInt(workStart.split(':')[0], 10);
    const endHour = parseInt(workEnd.split(':')[0], 10);
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Check if this day of week is in workDays
      const dayOfWeek = date.getDay();
      if (!workDays.includes(dayOfWeek)) continue;
      
      const dateStr = date.toISOString().split('T')[0];
      
      // Add slots for work hours in 1-hour increments
      for (let h = startHour; h < endHour; h++) {
        slots.push({
          trainer_id: trainerId,
          date: dateStr,
          start_time: `${String(h).padStart(2, '0')}:00`,
          end_time: `${String(h + 1).padStart(2, '0')}:00`,
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
        .from('trainer_availability')
        .upsert(batch, { onConflict: 'trainer_id,date,start_time' });
      
      if (error) {
        console.error('Error inserting batch:', error);
      } else {
        inserted += batch.length;
      }
    }

    return inserted;
  } catch (err) {
    console.error('generateTrainerSlots error:', err);
    return 0;
  }
}

// ─── Training Programs ────────────────────────────────────────────

export async function getTrainerPrograms(trainerId: string): Promise<TrainingProgram[]> {
  try {
    const { data, error } = await supabase
      .from('training_programs')
      .select('*')
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((program) => ({
      ...program,
      type: program.type as TrainingProgram['type'],
    }));
  } catch (err) {
    console.error('getTrainerPrograms error:', err);
    return [];
  }
}

export async function createTrainingProgram(
  program: Omit<TrainingProgram, 'id' | 'created_at'>
): Promise<TrainingProgram | null> {
  try {
    const { data, error } = await supabase
      .from('training_programs')
      .insert(program)
      .select()
      .single();

    if (error) throw error;
    return data as TrainingProgram;
  } catch (err) {
    console.error('createTrainingProgram error:', err);
    return null;
  }
}

export async function updateTrainingProgram(
  programId: string,
  updates: Partial<TrainingProgram>
): Promise<TrainingProgram | null> {
  try {
    const { data, error } = await supabase
      .from('training_programs')
      .update(updates)
      .eq('id', programId)
      .select()
      .single();

    if (error) throw error;
    return data as TrainingProgram;
  } catch (err) {
    console.error('updateTrainingProgram error:', err);
    return null;
  }
}

export async function deleteTrainingProgram(programId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('training_programs')
      .delete()
      .eq('id', programId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deleteTrainingProgram error:', err);
    return false;
  }
}

// ─── Reviews ──────────────────────────────────────────────────────

export async function getTrainerReviews(trainerId: string): Promise<TrainerReview[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id, booking_id, reviewer_profile_id, reviewee_profile_id, rating, comment, created_at,
        reviewer:profiles!reviews_reviewer_profile_id_fkey(display_name, avatar_url)
      `)
      .eq('reviewee_profile_id', trainerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      booking_id: row.booking_id,
      reviewer_id: row.reviewer_profile_id,
      reviewee_id: row.reviewee_profile_id,
      rating: row.rating,
      comment: row.comment,
      created_at: row.created_at,
      reviewer: row.reviewer
        ? {
            name: row.reviewer.display_name || 'Korisnik',
            avatar_url: row.reviewer.avatar_url,
          }
        : undefined,
    }));
  } catch (err) {
    console.error('getTrainerReviews error:', err);
    return [];
  }
}

// ─── Earnings ─────────────────────────────────────────────────────

export async function getTrainerEarnings(trainerId: string): Promise<{
  totalEarnings: number;
  thisMonthEarnings: number;
  monthlyEarnings: MonthlyEarnings[];
  completedBookings: TrainerBooking[];
}> {
  try {
    const { data, error } = await supabase
      .from('trainer_bookings')
      .select(`
        *,
        program:training_programs(id, name, type, price)
      `)
      .eq('trainer_id', trainerId)
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
      program: row.program || undefined,
    })) as TrainerBooking[];

    // Calculate earnings from completed bookings
    const totalEarnings = completedBookings.reduce((sum, b) => {
      // Use program price if available, otherwise 0
      return sum + (b.program?.price || 0);
    }, 0);

    const now = new Date();
    const thisMonthEarnings = completedBookings
      .filter((b) => {
        const bd = new Date(b.date);
        return bd.getMonth() === now.getMonth() && bd.getFullYear() === now.getFullYear();
      })
      .reduce((sum, b) => sum + (b.program?.price || 0), 0);

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
      const amount = monthBookings.reduce((sum, b) => sum + (b.program?.price || 0), 0);
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
    console.error('getTrainerEarnings error:', err);
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
    const { data: participants, error: participantError } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('profile_id', userId);

    if (participantError) throw participantError;
    const conversationIds = (participants || []).map((p) => p.conversation_id);
    if (conversationIds.length === 0) return 0;

    const lastReadByConversation = new Map(
      (participants || []).map((p) => [
        p.conversation_id,
        p.last_read_at ? new Date(p.last_read_at).getTime() : 0,
      ])
    );

    const { data: messages, error } = await supabase
      .from('messages')
      .select('conversation_id, sender_profile_id, created_at')
      .in('conversation_id', conversationIds)
      .neq('sender_profile_id', userId)
      .is('deleted_at', null);

    if (error) throw error;
    return (messages || []).filter(
      (message) =>
        new Date(message.created_at).getTime() >
        (lastReadByConversation.get(message.conversation_id) || 0)
    ).length;
  } catch (err) {
    console.error('getUnreadMessagesCount error:', err);
    return 0;
  }
}

// ─── Clients ──────────────────────────────────────────────────────

export async function getTrainerClients(trainerId: string): Promise<{
  id: string;
  name: string;
  avatar_url: string | null;
  email: string;
  phone: string | null;
  bookingCount: number;
  lastBooking: string | null;
}[]> {
  try {
    const { data, error } = await supabase
      .from('trainer_bookings')
      .select(`
        user_id,
        date
      `)
      .eq('trainer_id', trainerId)
      .order('date', { ascending: false });

    if (error) throw error;

    // Group by client
    const clientMap = new Map<string, {
      id: string;
      name: string;
      avatar_url: string | null;
      email: string;
      phone: string | null;
      bookingCount: number;
      lastBooking: string | null;
    }>();

    (data || []).forEach((row: any) => {
      if (!row.client) return;
      
      const clientId = row.client.id;
      if (!clientMap.has(clientId)) {
        clientMap.set(clientId, {
          id: clientId,
          name: row.client.name,
          avatar_url: row.client.avatar_url,
          email: row.client.email,
          phone: row.client.phone,
          bookingCount: 0,
          lastBooking: null,
        });
      }
      
      const client = clientMap.get(clientId)!;
      client.bookingCount++;
      if (!client.lastBooking || row.date > client.lastBooking) {
        client.lastBooking = row.date;
      }
    });

    return Array.from(clientMap.values()).sort((a, b) => 
      (b.lastBooking || '').localeCompare(a.lastBooking || '')
    );
  } catch (err) {
    console.error('getTrainerClients error:', err);
    return [];
  }
}
