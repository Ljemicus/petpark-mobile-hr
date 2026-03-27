import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { Colors } from '../lib/colors';

export default function TermsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Uvjeti korištenja</Text>
      <Text style={styles.updated}>Posljednje ažuriranje: 1. ožujka 2026.</Text>

      <Text style={styles.heading}>1. Prihvaćanje uvjeta</Text>
      <Text style={styles.body}>
        Korištenjem mobilne aplikacije Šapica pristajete na ove Uvjete korištenja. Ako se ne slažete
        s ovim uvjetima, molimo vas da ne koristite aplikaciju.
      </Text>

      <Text style={styles.heading}>2. Opis usluge</Text>
      <Text style={styles.body}>
        Šapica je platforma koja povezuje vlasnike kućnih ljubimaca s pružateljima usluga za ljubimce,
        uključujući:{'\n\n'}
        • Pet sitting — čuvanje i njega ljubimaca{'\n'}
        • Grooming — usluge uljepšavanja{'\n'}
        • Dresura — obuka i trening{'\n'}
        • Shop — kupovina proizvoda za ljubimce{'\n'}
        • Forum — zajednica za razmjenu iskustava{'\n'}
        • Izgubljeni ljubimci — pomoć u pronalasku
      </Text>

      <Text style={styles.heading}>3. Registracija i korisnički račun</Text>
      <Text style={styles.body}>
        Za korištenje svih funkcionalnosti potrebna je registracija. Obvezujete se:{'\n\n'}
        • Navesti točne i potpune podatke{'\n'}
        • Čuvati sigurnost svoje lozinke{'\n'}
        • Obavijestiti nas o neovlaštenom korištenju računa{'\n'}
        • Ne dijeliti račun s drugim osobama
      </Text>

      <Text style={styles.heading}>4. Pravila ponašanja</Text>
      <Text style={styles.body}>
        Korisnici se obvezuju:{'\n\n'}
        • Postupati s ljubimcima odgovorno i humano{'\n'}
        • Ne objavljivati lažne, uvredljive ili nezakonite sadržaje{'\n'}
        • Poštivati prava drugih korisnika{'\n'}
        • Ne koristiti aplikaciju u nezakonite svrhe{'\n'}
        • Ne pokušavati ometati rad aplikacije
      </Text>

      <Text style={styles.heading}>5. Usluge pet sittera</Text>
      <Text style={styles.body}>
        Šapica djeluje kao posrednik između vlasnika i pet sittera. Ne snosimo odgovornost za:{'\n\n'}
        • Kvalitetu usluge pojedinog sittera{'\n'}
        • Štetu nastalu za vrijeme čuvanja{'\n'}
        • Sporove između korisnika{'\n\n'}
        Preporučujemo korištenje sustava recenzija i provjeru verificiranih sittera.
      </Text>

      <Text style={styles.heading}>6. Kupovina u Shopu</Text>
      <Text style={styles.body}>
        Svi proizvodi u Šapica Shopu podliježu Zakonu o zaštiti potrošača. Imate pravo na
        povrat proizvoda u roku od 14 dana od primitka, u skladu s uvjetima povrata.
      </Text>

      <Text style={styles.heading}>7. Intelektualno vlasništvo</Text>
      <Text style={styles.body}>
        Sav sadržaj aplikacije (tekstovi, slike, logo, dizajn) vlasništvo je tvrtke Šapica d.o.o.
        i zaštićen je zakonom o autorskim pravima. Nije dopušteno kopiranje ili distribucija
        bez pisanog odobrenja.
      </Text>

      <Text style={styles.heading}>8. Ograničenje odgovornosti</Text>
      <Text style={styles.body}>
        Aplikacija se pruža „kakva jest". Ne jamčimo neprekidan ili besprijekoran rad. Naša
        odgovornost ograničena je u najvećoj mjeri dopuštenoj zakonom.
      </Text>

      <Text style={styles.heading}>9. Izmjene uvjeta</Text>
      <Text style={styles.body}>
        Zadržavamo pravo izmjene ovih uvjeta u bilo kojem trenutku. O značajnim promjenama
        bit ćete obaviješteni putem aplikacije ili e-mailom.
      </Text>

      <Text style={styles.heading}>10. Primjenjivo pravo</Text>
      <Text style={styles.body}>
        Na ove Uvjete primjenjuje se pravo Republike Hrvatske. Za rješavanje sporova
        nadležan je sud u Zagrebu.
      </Text>

      <Text style={styles.heading}>11. Kontakt</Text>
      <Text style={styles.body}>
        Za pitanja o uvjetima korištenja:{'\n\n'}
        E-mail: info@sapica.hr{'\n'}
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
