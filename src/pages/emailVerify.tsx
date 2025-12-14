import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import api from '../api/api';

function VerifyEmail() {
  const { id, hash } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const expires = searchParams.get('expires');
        const signature = searchParams.get('signature');

        // Appeler l'API backend avec tous les paramètres
        const response = await api.get(`/email/verify/${id}/${hash}`, {
          params: { expires, signature }
        });

        toast.success('Email vérifié avec succès !');
        
        // Rediriger vers la page de connexion ou dashboard
        setTimeout(() => {
          navigate('/auth');
        }, 2000);
        
      } catch (error: any) {
        console.error('Erreur de vérification:', error);
        
        if (error.response?.status === 403) {
          toast.error('Le lien de vérification a expiré ou est invalide');
        } else if (error.response?.status === 409) {
          toast.info('Cet email a déjà été vérifié');
          navigate('/auth');
        } else {
          toast.error('Erreur lors de la vérification de l\'email');
        }
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [id, hash, searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        {verifying ? (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Vérification en cours...
            </h2>
            <p className="text-gray-600">
              Veuillez patienter pendant que nous vérifions votre email.
            </p>
          </>
        ) : (
          <>
            <div className="text-green-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Email vérifié !
            </h2>
            <p className="text-gray-600">
              Vous allez être redirigé vers la page de connexion...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;