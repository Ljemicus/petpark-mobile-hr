export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      availability_slots: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          notes: string | null
          provider_id: string
          service_code: string | null
          source: string
          starts_at: string
          status: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          notes?: string | null
          provider_id: string
          service_code?: string | null
          source?: string
          starts_at: string
          status?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          notes?: string | null
          provider_id?: string
          service_code?: string | null
          source?: string
          starts_at?: string
          status?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_slots_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_items: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          line_total: number
          metadata: Json
          quantity: number
          service_code: string
          unit_price: number
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          line_total: number
          metadata?: Json
          quantity?: number
          service_code: string
          unit_price: number
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          line_total?: number
          metadata?: Json
          quantity?: number
          service_code?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_items_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_request_events: {
        Row: {
          actor_profile_id: string | null
          actor_role: string
          booking_request_id: string
          created_at: string
          event_type: string
          id: string
          metadata: Json
          new_status: string | null
          old_status: string | null
          summary: string
        }
        Insert: {
          actor_profile_id?: string | null
          actor_role: string
          booking_request_id: string
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          new_status?: string | null
          old_status?: string | null
          summary: string
        }
        Update: {
          actor_profile_id?: string | null
          actor_role?: string
          booking_request_id?: string
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          new_status?: string | null
          old_status?: string | null
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_request_events_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_request_events_booking_request_id_fkey"
            columns: ["booking_request_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_request_messages: {
        Row: {
          body: string
          booking_request_id: string
          created_at: string
          id: string
          metadata: Json
          sender_profile_id: string
          sender_role: string
        }
        Insert: {
          body: string
          booking_request_id: string
          created_at?: string
          id?: string
          metadata?: Json
          sender_profile_id: string
          sender_role: string
        }
        Update: {
          body?: string
          booking_request_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          sender_profile_id?: string
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_request_messages_booking_request_id_fkey"
            columns: ["booking_request_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_request_messages_sender_profile_id_fkey"
            columns: ["sender_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_requests: {
        Row: {
          contact_consent: boolean
          contact_source: string
          created_at: string
          end_date: string
          id: string
          mode: string
          notes: string
          owner_profile_id: string | null
          pet_name: string
          pet_type: string
          price_snapshot: string
          provider_city: string
          provider_district: string
          provider_name: string
          provider_slug: string
          requester_email: string | null
          requester_name: string | null
          requester_phone: string | null
          response_time_snapshot: string
          service_label: string
          source: string
          start_date: string
          status: string
          submitted_at: string
        }
        Insert: {
          contact_consent?: boolean
          contact_source?: string
          created_at?: string
          end_date: string
          id?: string
          mode: string
          notes: string
          owner_profile_id?: string | null
          pet_name: string
          pet_type: string
          price_snapshot: string
          provider_city: string
          provider_district: string
          provider_name: string
          provider_slug: string
          requester_email?: string | null
          requester_name?: string | null
          requester_phone?: string | null
          response_time_snapshot: string
          service_label: string
          source?: string
          start_date: string
          status?: string
          submitted_at?: string
        }
        Update: {
          contact_consent?: boolean
          contact_source?: string
          created_at?: string
          end_date?: string
          id?: string
          mode?: string
          notes?: string
          owner_profile_id?: string | null
          pet_name?: string
          pet_type?: string
          price_snapshot?: string
          provider_city?: string
          provider_district?: string
          provider_name?: string
          provider_slug?: string
          requester_email?: string | null
          requester_name?: string | null
          requester_phone?: string | null
          response_time_snapshot?: string
          service_label?: string
          source?: string
          start_date?: string
          status?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_owner_profile_id_fkey"
            columns: ["owner_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          accepted_at: string | null
          cancellation_reason: string | null
          completed_at: string | null
          created_at: string
          currency: string
          dispute_state: string | null
          ends_at: string
          id: string
          owner_note: string | null
          owner_profile_id: string
          payment_status: string
          pet_id: string
          platform_fee: number | null
          platform_fee_amount: number
          primary_service_code: string
          provider_amount: number | null
          provider_id: string
          provider_kind: string
          provider_note: string | null
          starts_at: string
          status: string
          stripe_checkout_session_id: string | null
          subtotal_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          cancellation_reason?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          dispute_state?: string | null
          ends_at: string
          id?: string
          owner_note?: string | null
          owner_profile_id: string
          payment_status?: string
          pet_id: string
          platform_fee?: number | null
          platform_fee_amount?: number
          primary_service_code: string
          provider_amount?: number | null
          provider_id: string
          provider_kind: string
          provider_note?: string | null
          starts_at: string
          status?: string
          stripe_checkout_session_id?: string | null
          subtotal_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          cancellation_reason?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          dispute_state?: string | null
          ends_at?: string
          id?: string
          owner_note?: string | null
          owner_profile_id?: string
          payment_status?: string
          pet_id?: string
          platform_fee?: number | null
          platform_fee_amount?: number
          primary_service_code?: string
          provider_amount?: number | null
          provider_id?: string
          provider_kind?: string
          provider_note?: string | null
          starts_at?: string
          status?: string
          stripe_checkout_session_id?: string | null
          subtotal_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_owner_profile_id_fkey"
            columns: ["owner_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          created_at: string
          last_read_at: string | null
          profile_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          last_read_at?: string | null
          profile_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          last_read_at?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          booking_id: string | null
          created_at: string
          created_by_profile_id: string
          id: string
          last_message_at: string | null
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          created_by_profile_id: string
          id?: string
          last_message_at?: string | null
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          created_by_profile_id?: string
          id?: string
          last_message_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          deleted_at: string | null
          id: string
          image_storage_path: string | null
          message_type: string
          sender_profile_id: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          image_storage_path?: string | null
          message_type?: string
          sender_profile_id: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          image_storage_path?: string | null
          message_type?: string
          sender_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_profile_id_fkey"
            columns: ["sender_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          booking_request_id: string | null
          created_at: string
          id: string
          metadata: Json
          read_at: string | null
          recipient_profile_id: string
          target_path: string
          title: string
          type: string
        }
        Insert: {
          body: string
          booking_request_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          read_at?: string | null
          recipient_profile_id: string
          target_path: string
          title: string
          type: string
        }
        Update: {
          body?: string
          booking_request_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          read_at?: string | null
          recipient_profile_id?: string
          target_path?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_booking_request_id_fkey"
            columns: ["booking_request_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_profile_id_fkey"
            columns: ["recipient_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          currency: string
          id: string
          paid_at: string | null
          platform_fee_amount: number
          provider_id: string
          raw_provider_payload: Json
          refund_status: string | null
          refunded_amount: number | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          platform_fee_amount?: number
          provider_id: string
          raw_provider_payload?: Json
          refund_status?: string | null
          refunded_amount?: number | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          platform_fee_amount?: number
          provider_id?: string
          raw_provider_payload?: Json
          refund_status?: string | null
          refunded_amount?: number | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_requests: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          notes: string | null
          payment_id: string | null
          processed_at: string | null
          provider_id: string
          requested_at: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          payment_id?: string | null
          processed_at?: string | null
          provider_id: string
          requested_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          payment_id?: string | null
          processed_at?: string | null
          provider_id?: string
          requested_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_requests_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_requests_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_passports: {
        Row: {
          created_at: string
          notes: string | null
          pet_id: string
          raw_json: Json
          updated_at: string
          vet_address: string | null
          vet_name: string | null
          vet_phone: string | null
        }
        Insert: {
          created_at?: string
          notes?: string | null
          pet_id: string
          raw_json?: Json
          updated_at?: string
          vet_address?: string | null
          vet_name?: string | null
          vet_phone?: string | null
        }
        Update: {
          created_at?: string
          notes?: string | null
          pet_id?: string
          raw_json?: Json
          updated_at?: string
          vet_address?: string | null
          vet_name?: string | null
          vet_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pet_passports_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: true
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          behavior_notes: string | null
          birth_date: string | null
          breed: string | null
          created_at: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          id: string
          is_active: boolean
          microchip_number: string | null
          name: string
          owner_profile_id: string
          sex: string | null
          special_needs: string | null
          species: string
          sterilized: boolean
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          behavior_notes?: string | null
          birth_date?: string | null
          breed?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          is_active?: boolean
          microchip_number?: string | null
          name: string
          owner_profile_id: string
          sex?: string | null
          special_needs?: string | null
          species: string
          sterilized?: boolean
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          behavior_notes?: string | null
          birth_date?: string | null
          breed?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          is_active?: boolean
          microchip_number?: string | null
          name?: string
          owner_profile_id?: string
          sex?: string | null
          special_needs?: string | null
          species?: string
          sterilized?: boolean
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pets_owner_profile_id_fkey"
            columns: ["owner_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_roles: {
        Row: {
          granted_at: string
          granted_by_profile_id: string | null
          profile_id: string
          role: string
        }
        Insert: {
          granted_at?: string
          granted_by_profile_id?: string | null
          profile_id: string
          role: string
        }
        Update: {
          granted_at?: string
          granted_by_profile_id?: string | null
          profile_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_roles_granted_by_profile_id_fkey"
            columns: ["granted_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          deleted_at: string | null
          display_name: string | null
          email: string
          id: string
          locale: string
          onboarding_state: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string | null
          email: string
          id: string
          locale?: string
          onboarding_state?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          locale?: string
          onboarding_state?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      provider_groomer_settings: {
        Row: {
          created_at: string
          mobile_service: boolean
          provider_id: string
          specialization: string | null
          updated_at: string
          working_hours_json: Json
        }
        Insert: {
          created_at?: string
          mobile_service?: boolean
          provider_id: string
          specialization?: string | null
          updated_at?: string
          working_hours_json?: Json
        }
        Update: {
          created_at?: string
          mobile_service?: boolean
          provider_id?: string
          specialization?: string | null
          updated_at?: string
          working_hours_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "provider_groomer_settings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: true
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_services: {
        Row: {
          base_price: number
          created_at: string
          currency: string
          duration_minutes: number | null
          id: string
          is_active: boolean
          provider_id: string
          service_code: string
          updated_at: string
        }
        Insert: {
          base_price: number
          created_at?: string
          currency?: string
          duration_minutes?: number | null
          id?: string
          is_active?: boolean
          provider_id: string
          service_code: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          created_at?: string
          currency?: string
          duration_minutes?: number | null
          id?: string
          is_active?: boolean
          provider_id?: string
          service_code?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_sitter_settings: {
        Row: {
          accepts_cats: boolean
          accepts_large_dogs: boolean
          accepts_small_dogs: boolean
          created_at: string
          has_yard: boolean
          home_type: string | null
          max_pets_per_day: number | null
          provider_id: string
          updated_at: string
        }
        Insert: {
          accepts_cats?: boolean
          accepts_large_dogs?: boolean
          accepts_small_dogs?: boolean
          created_at?: string
          has_yard?: boolean
          home_type?: string | null
          max_pets_per_day?: number | null
          provider_id: string
          updated_at?: string
        }
        Update: {
          accepts_cats?: boolean
          accepts_large_dogs?: boolean
          accepts_small_dogs?: boolean
          created_at?: string
          has_yard?: boolean
          home_type?: string | null
          max_pets_per_day?: number | null
          provider_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_sitter_settings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: true
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_trainer_settings: {
        Row: {
          certified: boolean
          created_at: string
          provider_id: string
          specializations: string[]
          training_location: string | null
          updated_at: string
        }
        Insert: {
          certified?: boolean
          created_at?: string
          provider_id: string
          specializations?: string[]
          training_location?: string | null
          updated_at?: string
        }
        Update: {
          certified?: boolean
          created_at?: string
          provider_id?: string
          specializations?: string[]
          training_location?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_trainer_settings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: true
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          address: string | null
          bio: string | null
          city: string | null
          created_at: string
          display_name: string
          email: string | null
          experience_years: number | null
          id: string
          instant_booking_enabled: boolean
          lat: number | null
          lng: number | null
          payout_last_status: string | null
          phone: string | null
          profile_id: string
          provider_kind: string
          public_status: string
          rating_avg: number
          response_time_label: string | null
          review_count: number
          stripe_account_id: string | null
          stripe_onboarding_complete: boolean
          updated_at: string
          verified_status: string
        }
        Insert: {
          address?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          display_name: string
          email?: string | null
          experience_years?: number | null
          id?: string
          instant_booking_enabled?: boolean
          lat?: number | null
          lng?: number | null
          payout_last_status?: string | null
          phone?: string | null
          profile_id: string
          provider_kind: string
          public_status?: string
          rating_avg?: number
          response_time_label?: string | null
          review_count?: number
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean
          updated_at?: string
          verified_status?: string
        }
        Update: {
          address?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          display_name?: string
          email?: string | null
          experience_years?: number | null
          id?: string
          instant_booking_enabled?: boolean
          lat?: number | null
          lng?: number | null
          payout_last_status?: string | null
          phone?: string | null
          profile_id?: string
          provider_kind?: string
          public_status?: string
          rating_avg?: number
          response_time_label?: string | null
          review_count?: number
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean
          updated_at?: string
          verified_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "providers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          provider_id: string | null
          rating: number
          reviewee_profile_id: string
          reviewer_profile_id: string
          status: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          provider_id?: string | null
          rating: number
          reviewee_profile_id: string
          reviewer_profile_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          provider_id?: string | null
          rating?: number
          reviewee_profile_id?: string
          reviewer_profile_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_profile_id_fkey"
            columns: ["reviewee_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_profile_id_fkey"
            columns: ["reviewer_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_listings: {
        Row: {
          availability_mode: string
          category: string | null
          city: string | null
          created_at: string
          description: string | null
          display_category: string | null
          district: string | null
          house_rules: Json
          id: string
          included_features: Json
          listed_at: string | null
          moderation_status: string
          photos: Json
          provider_id: string
          provider_service_id: string | null
          seo_description: string | null
          seo_title: string | null
          service_area: string | null
          short_description: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          availability_mode?: string
          category?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          display_category?: string | null
          district?: string | null
          house_rules?: Json
          id?: string
          included_features?: Json
          listed_at?: string | null
          moderation_status?: string
          photos?: Json
          provider_id: string
          provider_service_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          service_area?: string | null
          short_description?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          availability_mode?: string
          category?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          display_category?: string | null
          district?: string | null
          house_rules?: Json
          id?: string
          included_features?: Json
          listed_at?: string | null
          moderation_status?: string
          photos?: Json
          provider_id?: string
          provider_service_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          service_area?: string | null
          short_description?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_listings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_listings_provider_service_id_fkey"
            columns: ["provider_service_id"]
            isOneToOne: false
            referencedRelation: "provider_services"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_events: {
        Row: {
          event_id: string
          event_type: string
          payload: Json
          processed_at: string | null
          processing_result: Json | null
          received_at: string
        }
        Insert: {
          event_id: string
          event_type: string
          payload: Json
          processed_at?: string | null
          processing_result?: Json | null
          received_at?: string
        }
        Update: {
          event_id?: string
          event_type?: string
          payload?: Json
          processed_at?: string | null
          processing_result?: Json | null
          received_at?: string
        }
        Relationships: []
      }
      trainer_availability: {
        Row: {
          created_at: string
          date: string
          end_time: string
          id: string
          is_available: boolean
          start_time: string
          trainer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          end_time: string
          id?: string
          is_available?: boolean
          start_time: string
          trainer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          end_time?: string
          id?: string
          is_available?: boolean
          start_time?: string
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_availability_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_bookings: {
        Row: {
          created_at: string
          date: string
          end_time: string
          id: string
          note: string | null
          pet_name: string | null
          program_id: string | null
          start_time: string
          status: string
          trainer_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date: string
          end_time: string
          id?: string
          note?: string | null
          pet_name?: string | null
          program_id?: string | null
          start_time: string
          status?: string
          trainer_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          end_time?: string
          id?: string
          note?: string | null
          pet_name?: string | null
          program_id?: string | null
          start_time?: string
          status?: string
          trainer_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_bookings_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_bookings_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_reviews: {
        Row: {
          author_initial: string
          author_name: string
          comment: string
          created_at: string
          id: string
          rating: number
          trainer_id: string
        }
        Insert: {
          author_initial: string
          author_name: string
          comment: string
          created_at?: string
          id?: string
          rating: number
          trainer_id: string
        }
        Update: {
          author_initial?: string
          author_name?: string
          comment?: string
          created_at?: string
          id?: string
          rating?: number
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_reviews_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainers: {
        Row: {
          address: string | null
          bio: string
          certificates: Json
          certified: boolean
          city: string
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          price_per_hour: number
          rating: number
          review_count: number
          specializations: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          bio?: string
          certificates?: Json
          certified?: boolean
          city: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          price_per_hour?: number
          rating?: number
          review_count?: number
          specializations?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          bio?: string
          certificates?: Json
          certified?: boolean
          city?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          price_per_hour?: number
          rating?: number
          review_count?: number
          specializations?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      training_programs: {
        Row: {
          created_at: string
          description: string
          duration_weeks: number
          id: string
          name: string
          price: number
          sessions: number
          trainer_id: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          duration_weeks?: number
          id?: string
          name: string
          price?: number
          sessions?: number
          trainer_id: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          duration_weeks?: number
          id?: string
          name?: string
          price?: number
          sessions?: number
          trainer_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_programs_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist_requests: {
        Row: {
          city: string | null
          created_at: string
          email: string
          id: string
          service: string | null
          source_path: string | null
          user_agent: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          email: string
          id?: string
          service?: string | null
          source_path?: string | null
          user_agent?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string
          id?: string
          service?: string | null
          source_path?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      walk_checkpoints: {
        Row: {
          emoji: string | null
          id: string
          label: string | null
          lat: number | null
          lng: number | null
          recorded_at: string
          walk_id: string
        }
        Insert: {
          emoji?: string | null
          id?: string
          label?: string | null
          lat?: number | null
          lng?: number | null
          recorded_at?: string
          walk_id: string
        }
        Update: {
          emoji?: string | null
          id?: string
          label?: string | null
          lat?: number | null
          lng?: number | null
          recorded_at?: string
          walk_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "walk_checkpoints_walk_id_fkey"
            columns: ["walk_id"]
            isOneToOne: false
            referencedRelation: "walks"
            referencedColumns: ["id"]
          },
        ]
      }
      walks: {
        Row: {
          booking_id: string
          created_at: string
          distance_km: number | null
          ended_at: string | null
          ended_by_profile_id: string | null
          id: string
          owner_profile_id: string
          pet_id: string
          provider_id: string
          route_geojson: Json | null
          started_at: string | null
          started_by_profile_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          distance_km?: number | null
          ended_at?: string | null
          ended_by_profile_id?: string | null
          id?: string
          owner_profile_id: string
          pet_id: string
          provider_id: string
          route_geojson?: Json | null
          started_at?: string | null
          started_by_profile_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          distance_km?: number | null
          ended_at?: string | null
          ended_by_profile_id?: string | null
          id?: string
          owner_profile_id?: string
          pet_id?: string
          provider_id?: string
          route_geojson?: Json | null
          started_at?: string | null
          started_by_profile_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "walks_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "walks_ended_by_profile_id_fkey"
            columns: ["ended_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "walks_owner_profile_id_fkey"
            columns: ["owner_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "walks_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "walks_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "walks_started_by_profile_id_fkey"
            columns: ["started_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_provider_view_pet: {
        Args: { check_profile_id?: string; target_pet_id: string }
        Returns: boolean
      }
      is_admin: { Args: { check_profile_id?: string }; Returns: boolean }
      is_booking_participant: {
        Args: { check_profile_id?: string; target_booking_id: string }
        Returns: boolean
      }
      owns_provider: {
        Args: { check_profile_id?: string; target_provider_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
