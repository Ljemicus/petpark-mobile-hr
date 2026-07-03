import DisabledModule from '../../../components/shared/DisabledModule';

// TODO(petpark): breeder chat čeka aditivnu migraciju.
export default function BreederChatScreen() {
  return (
    <DisabledModule
      title="Poruke uzgajivača uskoro"
      icon="chatbubbles-outline"
      message="Radimo na tome. Hvala na strpljenju."
    />
  );
}
