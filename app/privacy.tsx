import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { Colors } from '../lib/colors';

export default function PrivacyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Politika privatnosti</Text>
      <Text style={styles.updated}>Posljednje ažuriranje: 1. ožujka 2026.</Text>

      <Text style={styles.heading}>1. Uvod</Text>
      <Text style={styles.body}>
        Šapica d.o.o. („mi", „nas" ili „naš") posvećena je zaštiti vaše privatnosti. Ova Politika privatnosti
        objašnjava kako prikupljamo, koristimo, otkrivamo i štitimo vaše osobne podatke kada koristite našu
        mobilnu aplikaciju Šapica i povezane usluge.
      </Text>

      <Text style={styles.heading}>2. Podaci koje prikupljamo</Text>
      <Text style={styles.body}>
        Možemo prikupljati sljedeće vrste podataka:{'\n\n'}
        • Osobni podaci: ime, e-mail adresa, telefonski broj, grad{'\n'}
        • Podaci o računu: lozinka (šifrirana), postavke profila, uloga (vlasnik/sitter){'\n'}
        • Podaci o korištenju: interakcije s aplikacijom, preferencije pretraživanja{'\n'}
        • Podaci o uređaju: model uređaja, operativni sustav, jedinstveni identifikatori{'\n'}
        • Podaci o lokaciji: približna lokacija (uz vaš pristanak)
      </Text>

      <Text style={styles.heading}>3. Kako koristimo vaše podatke</Text>
      <Text style={styles.body}>
        Vaše podatke koristimo za:{'\n\n'}
        • Pružanje i održavanje naših usluga{'\n'}
        • Povezivanje vlasnika ljubimaca s pet sitterima{'\n'}
        • Obradu narudžbi iz našeg shopa{'\n'}
        • Slanje obavijesti o aktivnostima na vašem računu{'\n'}
        • Poboljšanje naše aplikacije i korisničkog iskustva{'\n'}
        • Komunikaciju s vama o novostima i ponudama (uz vaš pristanak)
      </Text>

      <Text style={styles.heading}>4. Dijeljenje podataka</Text>
      <Text style={styles.body}>
        Vaše podatke ne prodajemo trećim stranama. Podatke možemo dijeliti s:{'\n\n'}
        • Pružateljima usluga koji nam pomažu u radu aplikacije{'\n'}
        • Drugim korisnicima u okviru funkcionalnosti aplikacije (npr. kontakt sa sitterom){'\n'}
        • Nadležnim tijelima kada to zahtijeva zakon
      </Text>

      <Text style={styles.heading}>5. Sigurnost podataka</Text>
      <Text style={styles.body}>
        Primjenjujemo odgovarajuće tehničke i organizacijske mjere za zaštitu vaših osobnih podataka.
        Koristimo SSL enkripciju za prijenos podataka i šifriranje za pohranu osjetljivih informacija.
      </Text>

      <Text style={styles.heading}>6. Vaša prava</Text>
      <Text style={styles.body}>
        U skladu s GDPR-om i hrvatskim zakonodavstvom, imate pravo na:{'\n\n'}
        • Pristup svojim osobnim podacima{'\n'}
        • Ispravak netočnih podataka{'\n'}
        • Brisanje podataka („pravo na zaborav"){'\n'}
        • Ograničenje obrade{'\n'}
        • Prenosivost podataka{'\n'}
        • Prigovor na obradu
      </Text>

      <Text style={styles.heading}>7. Kolačići i praćenje</Text>
      <Text style={styles.body}>
        Naša aplikacija može koristiti analitičke alate za praćenje korištenja. Možete upravljati svojim
        preferencijama praćenja u postavkama aplikacije.
      </Text>

      <Text style={styles.heading}>8. Kontakt</Text>
      <Text style={styles.body}>
        Za sva pitanja vezana uz privatnost, kontaktirajte nas:{'\n\n'}
        E-mail: privatnost@sapica.hr{'\n'}
        Adresa: Šapica d.o.o., Ilica 100, 10000 Zagreb, Hrvatska
      </Text>

      <Text style={styles.footer}>© 2026 Šapica d.o.o. Sva prava pridržana.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  updated: {
    fontSize: 13,
    color: Colors.muted,
    marginBottom: 24,
  },
  heading: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 20,
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    color: Colors.textSecondary,
  },
  footer: {
    fontSize: 13,
    color: Colors.muted,
    textAlign: 'center',
    marginTop: 32,
  },
});
