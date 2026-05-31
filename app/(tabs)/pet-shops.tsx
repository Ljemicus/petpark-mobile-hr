import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/colors';

interface PetShop {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  hours: string;
  website?: string;
}

const petShops: PetShop[] = [
  // Rijeka
  {
    id: '1',
    name: 'Pet Centar ZTC',
    city: 'Rijeka',
    address: 'Škurinjska cesta 1, 51000 Rijeka',
    phone: '051/309 811',
    hours: 'Pon-Sub: 8-21h, Ned: zatvoreno',
  },
  {
    id: '2',
    name: 'Pet Centar Škurinje',
    city: 'Rijeka',
    address: 'Škurinjska cesta 1, 51000 Rijeka',
    phone: '051/266 113',
    hours: 'Pon-Sub: 8-21h, Ned: zatvoreno',
  },
  {
    id: '3',
    name: 'VetPet Boutique',
    city: 'Rijeka',
    address: 'Tower Center Rijeka, Trg Ivice Kalebta 2',
    phone: '051/400-386',
    hours: 'Pon-Sub: 9-21h',
    website: 'https://vetpet.com.hr',
  },
  {
    id: '3a',
    name: 'Škola za pse Principi',
    city: 'Rijeka',
    address: 'Rijeka (točna adresa na web stranici)',
    phone: '091/123-4567',
    hours: 'Po dogovoru',
    website: 'https://principi.hr',
  },
  // Zagreb
  {
    id: '4',
    name: 'ZooCity Zagreb',
    city: 'Zagreb',
    address: 'Ul. Vice Vukova 6, 10000 Zagreb',
    phone: '01/411-1381',
    hours: 'Uto-Ned: 9-21h, Pon: zatvoreno',
    website: 'https://www.zoocity.hr',
  },
  {
    id: '5',
    name: 'Pet Home Shop',
    city: 'Zagreb',
    address: 'Maksimirska ulica 82, 10000 Zagreb',
    phone: '01/4850-611',
    hours: 'Pon-Pet: 8-20h, Sub: 8-14h',
    website: 'https://pethomeshop.hr',
  },
  {
    id: '6',
    name: 'Pet Shop Snoopy',
    city: 'Zagreb',
    address: 'Vitasovićeva poljana 10, 10000 Zagreb',
    phone: '095 383 8322',
    hours: 'Pon-Pet: 8-20h, Sub: 8-14h',
    website: 'https://petshopsnoopy.hr',
  },
  {
    id: '7',
    name: 'Ohana Pet Shop',
    city: 'Zagreb',
    address: 'Travanjska 4, 10000 Zagreb',
    phone: '01/5506-800',
    hours: 'Pon-Pet: 9-20h, Sub: 9-14h',
    website: 'https://ohana.hr',
  },
  // Split
  {
    id: '8',
    name: 'Pet Centar Split',
    city: 'Split',
    address: 'Put Mostina 8 (Dujmovača), 21000 Split',
    phone: '021/444 411',
    hours: 'Pon-Sub: 8-21h, Ned: zatvoreno',
  },
  // Osijek
  {
    id: '9',
    name: 'Pet Centar Osijek',
    city: 'Osijek',
    address: 'Ul. kralja Petra Svačića 61, 31000 Osijek',
    phone: '031/580 869',
    hours: 'Pon-Sub: 8-21h, Ned: zatvoreno',
  },
  {
    id: '10',
    name: 'Pet Home Shop Osijek',
    city: 'Osijek',
    address: 'Ribarska ulica 4, 31000 Osijek',
    phone: '031/659 234',
    hours: 'Pon-Sub: 8-20h, Ned: zatvoreno',
  },
  // Ostali gradovi
  {
    id: '11',
    name: 'ZooCity Zadar',
    city: 'Zadar',
    address: 'Ul. 4.Gardijske Brigade 1, 23000 Zadar',
    phone: '023/551-030',
    hours: 'Uto-Sub: 9-21h, Ned: zatvoreno, Pon: zatvoreno',
  },
  {
    id: '12',
    name: 'Pet Home Shop Pula',
    city: 'Pula',
    address: 'Pula (točna adresa na web stranici)',
    phone: '052/xxx-xxx',
    hours: 'Pon-Pet: 8-20h, Sub: 8-14h',
    website: 'https://pethomeshop.hr/poslovnice',
  },
  {
    id: '13',
    name: 'Pet Home Shop Varaždin',
    city: 'Varaždin',
    address: 'Varaždin (točna adresa na web stranici)',
    phone: '042/xxx-xxx',
    hours: 'Pon-Pet: 8-20h, Sub: 8-14h',
    website: 'https://pethomeshop.hr/poslovnice',
  },
];

const cities = ['Svi', 'Rijeka', 'Zagreb', 'Split', 'Osijek', 'Zadar', 'Pula', 'Varaždin'];

export default function PetShopsScreen() {
  const [selectedCity, setSelectedCity] = React.useState('Svi');

  const filteredShops = selectedCity === 'Svi' 
    ? petShops 
    : petShops.filter(shop => shop.city === selectedCity);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
  };

  const handleWebsite = (url?: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Pet Shopovi</Text>
        <Text style={styles.subtitle}>Trgovine za kućne ljubimce u Hrvatskoj</Text>
      </View>

      {/* City Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {cities.map(city => (
          <TouchableOpacity
            key={city}
            style={[
              styles.filterButton,
              selectedCity === city && styles.filterButtonActive
            ]}
            onPress={() => setSelectedCity(city)}
          >
            <Text style={[
              styles.filterText,
              selectedCity === city && styles.filterTextActive
            ]}>
              {city}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Shops List */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filteredShops.map(shop => (
          <View key={shop.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.nameContainer}>
                <Text style={styles.shopName}>{shop.name}</Text>
                <View style={styles.cityBadge}>
                  <Text style={styles.cityText}>{shop.city}</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={18} color={Colors.primary} />
                <Text style={styles.infoText}>{shop.address}</Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={18} color={Colors.primary} />
                <Text style={styles.infoText}>{shop.phone}</Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={18} color={Colors.primary} />
                <Text style={styles.infoText}>{shop.hours}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleCall(shop.phone)}
              >
                <Ionicons name="call" size={16} color={Colors.white} />
                <Text style={styles.actionText}>Nazovi</Text>
              </TouchableOpacity>

              {shop.website && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.secondaryButton]}
                  onPress={() => handleWebsite(shop.website)}
                >
                  <Ionicons name="globe-outline" size={16} color={Colors.primary} />
                  <Text style={[styles.actionText, styles.secondaryText]}>Web</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Prikazano {filteredShops.length} trgovina
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  filterContainer: {
    backgroundColor: Colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  filterTextActive: {
    color: Colors.white,
  },
  list: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shopName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  cityBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cityText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  cardBody: {
    padding: 16,
    paddingTop: 0,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  secondaryButton: {
    backgroundColor: Colors.primaryLight,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  secondaryText: {
    color: Colors.primary,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.muted,
  },
});
