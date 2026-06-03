# Additive remote schema plan — approval required

Do **not** apply this to remote without explicit human approval. Existing remote tables should remain untouched except for additive FKs/indexes/policies required by the new modules.

## Features that stay Uskoro until approved
- Forum/community topics and replies
- Shop catalog, product reviews, cart persistence
- Breeder/rescue dashboards and listings
- Pet extras: appointments, documents, timeline updates

## Forum
Tables:
- `forum_categories(id uuid pk, name text not null, emoji text, description text, sort_order int, created_at timestamptz, updated_at timestamptz)`
- `forum_topics(id uuid pk, category_id uuid fk forum_categories, author_profile_id uuid fk profiles, title text, preview text, body text, reply_count int default 0, last_activity_at timestamptz, created_at timestamptz, updated_at timestamptz, status text default 'published')`
- `forum_replies(id uuid pk, topic_id uuid fk forum_topics, author_profile_id uuid fk profiles, body text, is_expert boolean default false, created_at timestamptz, updated_at timestamptz, deleted_at timestamptz)`
RLS: public read for published categories/topics/replies; authenticated insert own topics/replies; authors update/delete own rows; admins moderate.

## Shop
Tables:
- `products(id uuid pk, slug text unique, name text, description text, price_cents int, currency text default 'EUR', image_url text, category text, status text default 'draft', stock_quantity int, created_at timestamptz, updated_at timestamptz)`
- `product_reviews(id uuid pk, product_id uuid fk products, reviewer_profile_id uuid fk profiles, rating int, comment text, status text default 'published', created_at timestamptz, updated_at timestamptz)`
- `cart_items(id uuid pk, user_profile_id uuid fk profiles, product_id uuid fk products, quantity int, created_at timestamptz, updated_at timestamptz, unique(user_profile_id, product_id))`
RLS: public read active products/reviews; authenticated manage own cart; authenticated insert own review; admins manage catalog/moderation. Payments remain gated off until separately approved.

## Breeder/rescue
Tables:
- `publisher_profiles(id uuid pk, profile_id uuid fk profiles, publisher_type text, display_name text, city text, bio text, verification_status text default 'pending', created_at timestamptz, updated_at timestamptz)`
- `litters(id uuid pk, publisher_id uuid fk publisher_profiles, title text, breed text, birth_date date, status text, created_at timestamptz, updated_at timestamptz)`
- `puppies(id uuid pk, litter_id uuid fk litters, name text, sex text, status text, price_cents int, photos jsonb default '[]', created_at timestamptz, updated_at timestamptz)`
- `applications(id uuid pk, publisher_id uuid fk publisher_profiles, puppy_id uuid fk puppies, applicant_profile_id uuid fk profiles, message text, status text default 'submitted', created_at timestamptz, updated_at timestamptz)`
- `breeder_reviews(id uuid pk, publisher_id uuid fk publisher_profiles, reviewer_profile_id uuid fk profiles, rating int, comment text, status text default 'published', created_at timestamptz)`
- `breeder_documents(id uuid pk, publisher_id uuid fk publisher_profiles, storage_path text, document_type text, status text default 'pending', uploaded_at timestamptz)`
- `rescue_listings(id uuid pk, publisher_id uuid fk publisher_profiles, pet_name text, species text, city text, description text, status text default 'published', photos jsonb default '[]', created_at timestamptz, updated_at timestamptz)`
- `rescue_appeals(id uuid pk, listing_id uuid fk rescue_listings, applicant_profile_id uuid fk profiles, message text, status text default 'submitted', created_at timestamptz, updated_at timestamptz)`
RLS: public read published listings/litters/puppies/reviews; publishers manage own content; applicants manage own applications/appeals; admins verify and moderate.

## Pet extras
Tables:
- `pet_appointments(id uuid pk, pet_id uuid fk pets, title text, date date, time text, provider_name text, notes text, status text default 'upcoming', created_at timestamptz, updated_at timestamptz)`
- `pet_documents(id uuid pk, pet_id uuid fk pets, title text, document_type text, storage_path text, uploaded_at timestamptz, created_at timestamptz)`
- `pet_updates(id uuid pk, booking_id uuid fk bookings, provider_id uuid fk providers, pet_id uuid fk pets, update_type text, emoji text, caption text, photo_url text, created_at timestamptz)`
RLS: pet owners and authorized booking providers can read/write per existing `can_provider_view_pet` / booking participant functions; admins full access.
