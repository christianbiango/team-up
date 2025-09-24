import SimpleNavbar from "@/components/navigation/SimpleNavbar";

const PolitiqueConfidentialite = () => {
  return (
    <>
      <SimpleNavbar
        title="Politique de Confidentialité"
        subtitle="Informations sur notre politique de confidentialité"
        backTo="/dashboard"
      />
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">
          Politique de Confidentialité
        </h1>
        <p className="mb-2">
          La présente politique de confidentialité décrit la manière dont
          TeamUp! collecte, utilise et protège les informations personnelles que
          vous nous fournissez lorsque vous utilisez notre site web
          https://teamup-sport.fr/.
        </p>
        <h2 className="text-xl font-semibold mb-2">
          Collecte des Informations
        </h2>
        <p className="mb-2">
          Nous collectons les informations suivantes :
          <ul className="list-disc ml-6">
            <li>
              Informations d&apos;identification (nom, adresse e-mail, etc.) que
              vous nous fournissez lors de l&apos;inscription ou de
              l&apos;utilisation de nos services.
            </li>
            <li>
              Informations de connexion (adresse IP, type de navigateur, etc.)
            </li>
            <li>
              Informations relatives à votre utilisation de notre site web
              (pages visitées, temps passé, etc.)
            </li>
          </ul>
        </p>
        <h2 className="text-xl font-semibold mb-2">
          Utilisation des Informations
        </h2>
        <p className="mb-2">
          Nous utilisons les informations collectées pour les finalités
          suivantes :
          <ul className="list-disc ml-6">
            <li>Fournir et améliorer nos services.</li>
            <li>Personnaliser votre expérience utilisateur.</li>
            <li>
              Vous contacter pour vous informer des mises à jour ou des offres
              spéciales.
            </li>
            <li>
              Analyser l&apos;utilisation de notre site web et améliorer son
              fonctionnement.
            </li>
          </ul>
        </p>
        <h2 className="text-xl font-semibold mb-2">
          Protection des Informations
        </h2>
        <p className="mb-2">
          Nous mettons en œuvre des mesures de sécurité appropriées pour
          protéger vos informations personnelles contre tout accès non autorisé,
          utilisation abusive ou divulgation.
        </p>
        <h2 className="text-xl font-semibold mb-2">Partage des Informations</h2>
        <p className="mb-2">
          Nous ne partageons pas vos informations personnelles avec des tiers,
          sauf si cela est nécessaire pour fournir nos services ou si la loi
          nous y oblige.
        </p>
        <h2 className="text-xl font-semibold mb-2">Vos Droits</h2>
        <p className="mb-2">
          Vous disposez des droits suivants :
          <ul className="list-disc ml-6">
            <li>Droit d&apos;accès à vos informations personnelles.</li>
            <li>Droit de rectification de vos informations personnelles.</li>
            <li>Droit de suppression de vos informations personnelles.</li>
            <li>
              Droit d&apos;opposition au traitement de vos informations
              personnelles.
            </li>
          </ul>
        </p>
        <h2 className="text-xl font-semibold mb-2">Contact</h2>
        <p>
          Pour toute question ou demande d&apos;information concernant notre
          politique de confidentialité, veuillez nous contacter à l&apos;adresse
          suivante : contact@teamup-sport.fr.
        </p>
      </div>
    </>
  );
};

export default PolitiqueConfidentialite;
