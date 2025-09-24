"use client";
import SimpleNavbar from "@/components/navigation/SimpleNavbar";

const MentionsLegales = () => {
  return (
    <>
      <SimpleNavbar
        title="Mentions Légales"
        subtitle="Informations légales concernant notre site"
        backTo="/dashboard"
      />
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Mentions Légales</h1>
        <p className="mb-2">
          Conformément aux dispositions de la loi, nous vous communiquons les
          informations suivantes :
        </p>
        <h2 className="text-xl font-semibold mb-2">Éditeur du Site</h2>
        <p className="mb-2">
          TeamUp!
          <br />
          1 rue de Paris, 75000 Paris
          <br />
          France
          <br />
          contact@teamup-sport.fr
        </p>
        <h2 className="text-xl font-semibold mb-2">
          Directeur de la Publication
        </h2>
        <p className="mb-2">TeamUp!</p>
        <h2 className="text-xl font-semibold mb-2">Hébergeur du Site</h2>
        <p className="mb-2">
          Vercel
          <br />
          San francisco, Californie
          <br />
        </p>
        <h2 className="text-xl font-semibold mb-2">Propriété Intellectuelle</h2>
        <p className="mb-2">
          L&apos;ensemble du contenu du présent site, incluant, de façon non
          limitative, les textes, images, logos, graphismes, est la propriété
          exclusive de TeamUp!, à l&apos;exception des marques, logos ou
          contenus appartenant à d&apos;autres sociétés partenaires ou auteurs.
        </p>
        <p className="mb-2">
          Toute reproduction, distribution, modification, adaptation,
          retransmission ou publication, même partielle, de ces différents
          éléments est strictement interdite sans l&apos;accord exprès par écrit
          de TeamUp!.
        </p>
        <h2 className="text-xl font-semibold mb-2">
          Limitation de Responsabilité
        </h2>
        <p className="mb-2">
          TeamUp! ne saurait être tenu pour responsable des erreurs ou omissions
          dans les informations diffusées ou des problèmes techniques rencontrés
          sur le site.
        </p>
        <h2 className="text-xl font-semibold mb-2">Contact</h2>
        <p>
          Pour toute question ou demande d&apos;information concernant le site,
          veuillez nous contacter à l&apos;adresse suivante :
          contact@teamup-sport.fr.
        </p>
      </div>
    </>
  );
};

export default MentionsLegales;
