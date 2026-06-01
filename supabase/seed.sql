-- PetPark Mobile local/dev seed. Idempotent, local-only.
create extension if not exists pgcrypto;

-- Auth users for local dev (password: Petpark123!)
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) values
  ('11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-000000000000','authenticated','authenticated','owner@petpark.local',crypt('Petpark123!', gen_salt('bf')),now(),now(),now(),'{"provider":"email","providers":["email"]}','{"name":"Ana Vlasnica"}'),
  ('22222222-2222-2222-2222-222222222222','00000000-0000-0000-0000-000000000000','authenticated','authenticated','sitter@petpark.local',crypt('Petpark123!', gen_salt('bf')),now(),now(),now(),'{"provider":"email","providers":["email"]}','{"name":"Marko Čuvar"}'),
  ('33333333-3333-3333-3333-333333333333','00000000-0000-0000-0000-000000000000','authenticated','authenticated','groomer@petpark.local',crypt('Petpark123!', gen_salt('bf')),now(),now(),now(),'{"provider":"email","providers":["email"]}','{"name":"Maja Grooming"}'),
  ('44444444-4444-4444-4444-444444444444','00000000-0000-0000-0000-000000000000','authenticated','authenticated','trainer@petpark.local',crypt('Petpark123!', gen_salt('bf')),now(),now(),now(),'{"provider":"email","providers":["email"]}','{"name":"Ivan Trener"}'),
  ('55555555-5555-5555-5555-555555555555','00000000-0000-0000-0000-000000000000','authenticated','authenticated','breeder@petpark.local',crypt('Petpark123!', gen_salt('bf')),now(),now(),now(),'{"provider":"email","providers":["email"]}','{"name":"Luna Uzgajivačnica"}'),
  ('66666666-6666-6666-6666-666666666666','00000000-0000-0000-0000-000000000000','authenticated','authenticated','rescue@petpark.local',crypt('Petpark123!', gen_salt('bf')),now(),now(),now(),'{"provider":"email","providers":["email"]}','{"name":"Rijeka Rescue"}')
on conflict (id) do nothing;

insert into public.users (id, full_name, name, email, phone, city, role, avatar, avatar_url, onboarding_completed)
values
 ('11111111-1111-1111-1111-111111111111','Ana Vlasnica','Ana Vlasnica','owner@petpark.local','+385911111111','Rijeka','owner','🐶',null,true),
 ('22222222-2222-2222-2222-222222222222','Marko Čuvar','Marko Čuvar','sitter@petpark.local','+385922222222','Rijeka','sitter','🦮',null,true),
 ('33333333-3333-3333-3333-333333333333','Maja Grooming','Maja Grooming','groomer@petpark.local','+385933333333','Rijeka','groomer','✂️',null,true),
 ('44444444-4444-4444-4444-444444444444','Ivan Trener','Ivan Trener','trainer@petpark.local','+385944444444','Rijeka','trainer','🎓',null,true),
 ('55555555-5555-5555-5555-555555555555','Luna Uzgajivačnica','Luna Uzgajivačnica','breeder@petpark.local','+385955555555','Rijeka','breeder','🐕',null,true),
 ('66666666-6666-6666-6666-666666666666','Rijeka Rescue','Rijeka Rescue','rescue@petpark.local','+385966666666','Rijeka','rescue','🧡',null,true)
on conflict (id) do update set
 full_name=excluded.full_name, name=excluded.name, email=excluded.email, phone=excluded.phone,
 city=excluded.city, role=excluded.role, avatar=excluded.avatar, onboarding_completed=true;

insert into public.sitter_profiles (id, user_id, bio, services, price_per_hour, prices, rating, rating_avg, review_count, verified, avatar, city, experience_years, instant_booking, verification_status)
values ('22222222-2222-2222-2222-222222222222','22222222-2222-2222-2222-222222222222','Čuvanje i šetnje u Rijeci, naviknut na male i velike pse.',array['boarding','walking','drop-in'],18,'{"boarding":28,"walking":12,"drop-in":10}'::jsonb,4.9,4.9,18,true,'🦮','Rijeka',5,true,'verified')
on conflict (id) do update set bio=excluded.bio, services=excluded.services, price_per_hour=excluded.price_per_hour, prices=excluded.prices, rating=excluded.rating, rating_avg=excluded.rating_avg, review_count=excluded.review_count, verified=true, city=excluded.city, user_id=excluded.user_id;

insert into public.pets (id, owner_id, name, species, breed, age, weight, special_needs, photo_url)
values
 ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','11111111-1111-1111-1111-111111111111','Roko','dog','Mješanac',4,18,'Voli duže šetnje i ne voli petarde.',null),
 ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','11111111-1111-1111-1111-111111111111','Mila','cat','Europska kratkodlaka',3,4.2,'Hrana bez piletine.',null)
on conflict (id) do update set name=excluded.name, special_needs=excluded.special_needs;

insert into public.pet_passports (pet_id, vaccinations, allergies, medications, vet_info, notes)
values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','[{"name":"Bjesnoća","date":"2026-03-01","vet":"Vet Rijeka","next_date":"2027-03-01"}]','[]','[]','{"name":"Vet Rijeka","phone":"+38551123456","address":"Rijeka","emergency":true}','Roko je miran kod veterinara.')
on conflict (pet_id) do update set vaccinations=excluded.vaccinations, vet_info=excluded.vet_info, notes=excluded.notes;

insert into public.pet_appointments (id, pet_id, type, title, date, time, vet_name, status)
values ('cccccccc-cccc-cccc-cccc-cccccccccccc','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','checkup','Godišnji pregled',current_date + interval '14 days','10:00','Vet Rijeka','upcoming')
on conflict (id) do nothing;

insert into public.bookings (id, owner_id, sitter_id, pet_id, service_type, start_date, end_date, status, total_price, platform_fee, note, address, message, payment_status)
values
 ('dddddddd-dddd-dddd-dddd-dddddddddddd','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','walking',current_date,current_date,'accepted',12,1.2,'Roko voli park kod Trsata.','Rijeka','Može šetnja oko 17h?','unpaid'),
 ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','drop-in',current_date + interval '2 days',current_date + interval '2 days','pending',10,1,'Provjeriti hranu i vodu.',null,'Kratki posjet za Milu.','unpaid')
on conflict (id) do update set status=excluded.status, total_price=excluded.total_price, note=excluded.note;

insert into public.availability (sitter_id, date, available)
values ('22222222-2222-2222-2222-222222222222', current_date, true), ('22222222-2222-2222-2222-222222222222', current_date + interval '1 day', true)
on conflict (sitter_id,date) do update set available=excluded.available;

insert into public.messages (id, sender_id, receiver_id, booking_id, content, read, created_at)
values
 ('f1111111-1111-1111-1111-111111111111','11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','dddddddd-dddd-dddd-dddd-dddddddddddd','Bok Marko, može šetnja danas?',true,now() - interval '2 hours'),
 ('f2222222-2222-2222-2222-222222222222','22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111','dddddddd-dddd-dddd-dddd-dddddddddddd','Može, vidimo se u 17h.',false,now() - interval '90 minutes')
on conflict (id) do nothing;

insert into public.walks (id, sitter_id, pet_id, booking_id, start_time, end_time, status, distance_km, route, checkpoints)
values ('f3333333-3333-3333-3333-333333333333','22222222-2222-2222-2222-222222222222','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','dddddddd-dddd-dddd-dddd-dddddddddddd',now() - interval '1 day',now() - interval '1 day' + interval '45 minutes','zavrsena',2.4,'[{"lat":45.327,"lng":14.442},{"lat":45.329,"lng":14.445}]','[{"time":"17:20","label":"Park","emoji":"🌳","lat":45.328,"lng":14.443}]')
on conflict (id) do update set distance_km=excluded.distance_km, status=excluded.status;

insert into public.groomers (id, user_id, name, city, services, prices, rating, review_count, bio, verified, specialization, phone, email, address)
values ('33333333-aaaa-3333-aaaa-333333333333','33333333-3333-3333-3333-333333333333','Maja Grooming','Rijeka',array['sisanje','kupanje','nokti'],'{"sisanje":35,"kupanje":25,"nokti":10}'::jsonb,4.8,22,'Nježan grooming za pse i mačke.',true,'oba','+385933333333','groomer@petpark.local','Rijeka')
on conflict (id) do update set name=excluded.name, prices=excluded.prices;

insert into public.groomer_bookings (id,groomer_id,user_id,service,date,start_time,end_time,price,status,pet_name,pet_type,note)
values ('33333333-bbbb-3333-bbbb-333333333333','33333333-aaaa-3333-aaaa-333333333333','11111111-1111-1111-1111-111111111111','sisanje',current_date + interval '3 days','09:00','10:00',35,'pending','Roko','dog','Kratko šišanje')
on conflict (id) do update set status=excluded.status;

insert into public.groomer_availability (groomer_id,date,start_time,end_time,is_available)
values ('33333333-aaaa-3333-aaaa-333333333333',current_date + interval '3 days','09:00','10:00',true)
on conflict (groomer_id,date,start_time) do update set is_available=true;

insert into public.groomer_portfolio (id,groomer_id,url,caption,is_before_after)
values ('33333333-cccc-3333-cccc-333333333333','33333333-aaaa-3333-aaaa-333333333333','https://example.com/grooming.jpg','Prije i poslije šišanja',true)
on conflict (id) do nothing;

insert into public.trainers (id,user_id,name,city,specializations,price_per_hour,certificates,rating,review_count,bio,certified,phone,email,address)
values ('44444444-aaaa-4444-aaaa-444444444444','44444444-4444-4444-4444-444444444444','Ivan Trener','Rijeka',array['osnovna','ponasanje'],30,array['KPA'],4.7,16,'Osnovna poslušnost i korekcija ponašanja.',true,'+385944444444','trainer@petpark.local','Rijeka')
on conflict (id) do update set name=excluded.name;

insert into public.training_programs (id,trainer_id,name,type,duration_weeks,sessions,price,description)
values ('44444444-bbbb-4444-bbbb-444444444444','44444444-aaaa-4444-aaaa-444444444444','Osnovna poslušnost','osnovna',4,8,220,'Program za osnovne komande i šetnju bez povlačenja.')
on conflict (id) do update set price=excluded.price;

insert into public.trainer_bookings (id,trainer_id,user_id,program_id,date,start_time,end_time,status,pet_name,note,price)
values ('44444444-cccc-4444-cccc-444444444444','44444444-aaaa-4444-aaaa-444444444444','11111111-1111-1111-1111-111111111111','44444444-bbbb-4444-bbbb-444444444444',current_date + interval '4 days','18:00','19:00','confirmed','Roko','Fokus na povlačenje u šetnji.',30)
on conflict (id) do update set status=excluded.status;

insert into public.trainer_availability (trainer_id,date,start_time,end_time,is_available)
values ('44444444-aaaa-4444-aaaa-444444444444',current_date + interval '4 days','18:00','19:00',true)
on conflict (trainer_id,date,start_time) do update set is_available=true;

insert into public.publisher_profiles (id,user_id,type,display_name,bio,city,phone,breeds,species,years_experience,fci_registered,certified,verified,verification_status,profile_completeness_pct)
values ('55555555-aaaa-5555-aaaa-555555555555','55555555-5555-5555-5555-555555555555','uzgajivač','Luna Uzgajivačnica','Mali obiteljski uzgoj retrivera.','Rijeka','+385955555555',array['Zlatni retriver'],array['dog'],8,true,true,true,'verified',90)
on conflict (id) do update set display_name=excluded.display_name;

insert into public.litters (id,breeder_id,breed,species,birth_date,total_puppies,available_count,reserved_count,sold_count,price_from,price_to,status,description,fci_registered,images)
values ('55555555-bbbb-5555-bbbb-555555555555','55555555-aaaa-5555-aaaa-555555555555','Zlatni retriver','dog',current_date - interval '20 days',5,3,1,1,900,1200,'available','Veselo leglo, roditelji testirani.',true,array[]::text[])
on conflict (id) do update set available_count=excluded.available_count;

insert into public.puppies (id,litter_id,name,gender,color,status,price,notes)
values ('55555555-cccc-5555-cccc-555555555555','55555555-bbbb-5555-bbbb-555555555555','Nala','female','zlatna','available',1000,'Mirna i znatiželjna.')
on conflict (id) do update set status=excluded.status;

insert into public.applications (id,breeder_id,from_name,from_email,from_phone,breed_interest,message,status)
values ('55555555-dddd-5555-dddd-555555555555','55555555-aaaa-5555-aaaa-555555555555','Petra','petra@example.com','+385981234567','Zlatni retriver','Zanimamo se za žensko štene.','new')
on conflict (id) do update set status=excluded.status;

insert into public.breeder_reviews (id,breeder_id,reviewer_name,rating,comment)
values ('55555555-eeee-5555-eeee-555555555555','55555555-aaaa-5555-aaaa-555555555555','Marin',5,'Odlična komunikacija i zdravi štenci.')
on conflict (id) do nothing;

insert into public.rescue_listings (id,user_id,pet_name,species,city,status,description)
values ('66666666-aaaa-6666-aaaa-666666666666','66666666-6666-6666-6666-666666666666','Bela','dog','Rijeka','available','Traži miran dom i puno šetnji.')
on conflict (id) do update set status=excluded.status;

insert into public.rescue_appeals (id,user_id,title,body,status)
values ('66666666-bbbb-6666-bbbb-666666666666','66666666-6666-6666-6666-666666666666','Hrana za privremeni smještaj','Trebamo suhu hranu za pse srednje veličine.','open')
on conflict (id) do update set status=excluded.status;

insert into public.products (id,slug,name,category,price,original_price,description,emoji,brand,rating,review_count,in_stock,variants,specs,images)
values
 ('77777777-1111-7777-1111-777777777777','premium-suha-hrana-piletina','Premium suha hrana piletina','hrana',24.90,29.90,'Kompletna hrana za odrasle pse.','🍗','PetPark Select',4.8,42,true,'[{"label":"Pakiranje","value":"2 kg"},{"label":"Pakiranje","value":"7 kg","priceModifier":18}]','{"Protein":"27%","Dob":"Adult"}',array['🍗','🥣']),
 ('77777777-2222-7777-2222-777777777777','kong-classic','KONG Classic igračka','igracke',13.50,null,'Interaktivna igračka za žvakanje.','🎾','KONG',4.9,65,true,'[{"label":"Veličina","value":"M"}]','{"Materijal":"Prirodna guma"}',array['🎾'])
on conflict (id) do update set price=excluded.price, rating=excluded.rating;

insert into public.product_reviews (id,product_id,author_name,rating,comment)
values ('77777777-aaaa-7777-aaaa-777777777777','77777777-1111-7777-1111-777777777777','Ana',5,'Roko obožava ovu hranu.')
on conflict (id) do nothing;

insert into public.notifications (id,user_id,type,title,body,target_path,read_at)
values
 ('88888888-1111-8888-1111-888888888888','11111111-1111-1111-1111-111111111111','booking','Upit prihvaćen','Marko je prihvatio šetnju za Roka.','/booking/dddddddd-dddd-dddd-dddd-dddddddddddd',null),
 ('88888888-2222-8888-2222-888888888888','22222222-2222-2222-2222-222222222222','message','Nova poruka','Ana je poslala poruku za šetnju.','/dashboard/sitter/messages',null)
on conflict (id) do update set read_at=excluded.read_at;

-- Forum seed
insert into public.forum_categories (id, slug, name, emoji, description, sort_order)
values
 ('99990000-0000-0000-0000-000000000001','zdravlje','Zdravlje','🏥','Pitanja o zdravlju ljubimaca',1),
 ('99990000-0000-0000-0000-000000000002','prehrana','Prehrana','🍖','Savjeti o prehrani',2),
 ('99990000-0000-0000-0000-000000000003','dresura','Dresura','🎓','Savjeti za trening i dresuru',3),
 ('99990000-0000-0000-0000-000000000004','oprema','Oprema','🎒','Preporuke za opremu',4),
 ('99990000-0000-0000-0000-000000000005','izgubljeni','Izgubljeni','🔍','Izgubljeni i pronađeni ljubimci',5),
 ('99990000-0000-0000-0000-000000000006','udomljavanje','Udomljavanje','🏠','Udomljavanje životinja',6),
 ('99990000-0000-0000-0000-000000000007','grooming','Grooming','✂️','Njega i grooming savjeti',7),
 ('99990000-0000-0000-0000-000000000008','price','Priče','💬','Priče o ljubimcima',8)
on conflict (id) do update set name=excluded.name, emoji=excluded.emoji, description=excluded.description, sort_order=excluded.sort_order;

insert into public.forum_topics (id, category_id, author_id, author_name, title, preview, reply_count, last_activity_at)
values
 ('99991111-0000-0000-0000-000000000001','99990000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','Ana K.','Moj pas ne jede već 2 dana - što da radim?','Moj labrador od 5 godina je odjednom prestao jesti. Ima li netko sličan problem?',3,now() - interval '2 hours'),
 ('99991111-0000-0000-0000-000000000002','99990000-0000-0000-0000-000000000002','22222222-2222-2222-2222-222222222222','Marko P.','Najbolja hrana za štence zlatnog retrivera?','Upravo sam dobio štene zlatnog retrivera i trebam preporuke za hranu.',1,now() - interval '1 hour'),
 ('99991111-0000-0000-0000-000000000003','99990000-0000-0000-0000-000000000003','44444444-4444-4444-4444-444444444444','Ivan T.','Kako naučiti psa da ne vuče na povodcu?','Moj pas stalno vuče na povodcu i šetnje su postale naporne.',2,now() - interval '30 minutes'),
 ('99991111-0000-0000-0000-000000000004','99990000-0000-0000-0000-000000000005','66666666-6666-6666-6666-666666666666','Rijeka Rescue','IZGUBLJEN - crni mačak, područje Trsata','Izgubljen je crni mačak s bijelom mrljom na prsima.',0,now() - interval '15 minutes')
on conflict (id) do update set title=excluded.title, preview=excluded.preview, reply_count=excluded.reply_count, last_activity_at=excluded.last_activity_at;

insert into public.forum_replies (id, topic_id, author_id, author_name, body, is_expert, created_at)
values
 ('99992222-0000-0000-0000-000000000001','99991111-0000-0000-0000-000000000001','44444444-4444-4444-4444-444444444444','Dr. Vera M.','Ako traje dulje od 24 sata ili se pojave povraćanje i umor, nazovite veterinara.',true,now() - interval '1 hour'),
 ('99992222-0000-0000-0000-000000000002','99991111-0000-0000-0000-000000000001','22222222-2222-2222-2222-222222222222','Marko Č.','Moj pas je imao slično, kod nas je bio problem sa zubima.',false,now() - interval '50 minutes'),
 ('99992222-0000-0000-0000-000000000003','99991111-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111','Ana V.','Nama je pomoglo nagrađivanje čim povodac ostane opušten.',false,now() - interval '20 minutes')
on conflict (id) do update set body=excluded.body, is_expert=excluded.is_expert;
