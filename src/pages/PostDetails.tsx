import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const PostDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [ , setImageError] = useState(false);

  useEffect(() => {
    loadEverything();
  }, []);

  const loadEverything = async () => {
    setLoading(true);

    // usuario logueado
    const { data: authData } = await supabase.auth.getUser();
    setUserId(authData.user?.id || null);

    // obtener post
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();

    if (postError || !postData) {
      setPost(null);
      setLoading(false);
      return;
    }

    setPost(postData);

    // obtener info del vendedor
    const { data: sellerData, error: sellerError } = await supabase
      .from("profiles")
      .select("full_name, email, kyc_verified, rating, reviews")
      .eq("id", postData.user_id)
      .single();

    console.log("Datos del vendedor crudos:", sellerData);
    console.log("Tipo de reviews:", typeof sellerData?.reviews);
    console.log("Valor de reviews:", sellerData?.reviews);

    if (sellerError) {
      console.error("Error al cargar vendedor:", sellerError);
      setSeller(null);
    } else if (sellerData) {
      // Procesar reviews como texto
      let processedReviews = [];

      if (sellerData.reviews) {
        try {
          // Si es un string JSON, intentar parsearlo
          const trimmedReviews = sellerData.reviews.trim();

          if (trimmedReviews.startsWith('[') && trimmedReviews.endsWith(']')) {
            // Es un array JSON
            processedReviews = JSON.parse(trimmedReviews);
          } else if (trimmedReviews.startsWith('{') && trimmedReviews.endsWith('}')) {
            // Es un objeto JSON
            const obj = JSON.parse(trimmedReviews);
            // Convertir objeto a array
            if (Array.isArray(obj)) {
              processedReviews = obj;
            } else if (typeof obj === 'object') {
              // Si es un objeto con propiedades de reseñas
              processedReviews = Object.values(obj);
            }
          } else if (trimmedReviews.includes(',')) {
            // Es una lista separada por comas
            processedReviews = trimmedReviews.split(',').map((r: string) => r.trim()).filter((r: string) => r.length > 0);
          } else if (trimmedReviews.length > 0) {
            // Es un solo string
            processedReviews = [trimmedReviews];
          }
        } catch (error) {
          console.error("Error procesando reviews:", error);
          // Si falla el parseo, usar el string como array de un elemento
          processedReviews = sellerData.reviews ? [sellerData.reviews] : [];
        }
      }

      // Crear seller con reviews procesadas
      const processedSeller = {
        ...sellerData,
        reviews: Array.isArray(processedReviews) ? processedReviews : []
      };

      console.log("Seller procesado:", processedSeller);
      console.log("Reviews procesadas (array):", processedReviews);

      setSeller(processedSeller);
    } else {
      setSeller(null);
    }

    setLoading(false);
  };

  const handleBuy = async () => {
    if (!userId) return alert("Debes iniciar sesión");

    if (userId === post.user_id)
      return alert("No puedes comprar tu propio producto");

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        post_id: post.id,
        buyer_id: userId,
        seller_id: post.user_id,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.log(error);
      alert("Error al generar la orden");
    } else {
      alert("Orden generada correctamente");
      navigate(`/order/${order.id}`);
    }
  };

  const markAsSold = async () => {
    const { error } = await supabase
      .from("posts")
      .update({ sold: true })
      .eq("id", post.id);

    if (error) alert("Error al actualizar");
    else {
      alert("Marcado como vendido");
      loadEverything();
    }
  };

  const renderStars = (rating: number) => {
    if (!rating) return "Sin calificaciones";

    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;

    return (
      <div className="flex items-center">
        <span className="text-yellow-400 text-lg">
          {"★".repeat(fullStars)}
          <span className="text-gray-600">{"★".repeat(emptyStars)}</span>
        </span>
        <span className="text-gray-400 ml-2 text-sm">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const renderReviews = (reviews: any[]) => {
    console.log("Renderizando reviews (array recibido):", reviews);

    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return (
        <div className="bg-gray-800/30 p-4 rounded-xl text-center">
          <p className="text-gray-500">El vendedor aún no tiene reseñas</p>
          <p className="text-gray-600 text-sm mt-1">Sé el primero en calificar</p>
        </div>
      );
    }

    return (
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {reviews.map((review: any, idx: number) => {
          console.log(`Review ${idx}:`, review, "Tipo:", typeof review);

          let reviewText = "";

          // Extraer el texto de la reseña
          if (typeof review === 'string') {
            reviewText = review;
          } else if (review && typeof review === 'object') {
            // Si es un objeto, buscar propiedades comunes
            reviewText = review.comment || review.text || review.review ||
              review.message || review.content ||
              (review.rating ? `Calificación: ${review.rating}/5` : '');

            // Si no se encontró texto válido, mostrar el objeto
            if (!reviewText && Object.keys(review).length > 0) {
              reviewText = JSON.stringify(review);
            }
          } else if (review !== null && review !== undefined) {
            reviewText = String(review);
          }

          return (
            <div key={idx} className="bg-gray-800/30 p-4 rounded-xl">
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-sm">👤</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-300 text-sm">{reviewText || "Reseña sin contenido"}</p>
                  {review && typeof review === 'object' && review.rating && (
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-400 text-xs">
                        {"★".repeat(Math.floor(review.rating))}
                      </span>
                      <span className="text-gray-600 text-xs ml-1">
                        ({review.rating}/5)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading)
    return (
      <div className="w-screen min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-white text-lg font-medium">Cargando publicación...</p>
      </div>
    );

  if (!post)
    return (
      <div className="w-screen min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-white mb-2">Publicación no encontrada</h2>
          <p className="text-gray-400 mb-6">La publicación que buscas no existe o fue eliminada.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold text-white w-full transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );

  return (
    <div className="w-screen h-screen bg-black text-white overflow-x-hidden">
      {/* Header fijo */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </button>
          <button
            onClick={() => navigate("/explore")}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Inicio
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Columna izquierda - Imagen y detalles */}
          <div className="lg:w-2/5 space-y-6">
            {/* Imagen principal */}
            <div className="relative group">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black border border-gray-800">
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    alt={post.title}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-gray-600 text-6xl">📷</div>
                  </div>
                )}
              </div>
              {post.sold && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                  VENDIDO
                </div>
              )}
              {!post.sold && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                  DISPONIBLE
                </div>
              )}
            </div>

            {/* Detalles rápidos */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Detalles del producto
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-xl">
                  <span className="text-gray-400">Estado</span>
                  <span className={`font-semibold ${post.sold ? 'text-red-400' : 'text-green-400'}`}>
                    {post.sold ? "Vendido" : "En venta"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-xl">
                  <span className="text-gray-400">Publicado</span>
                  <span className="font-semibold">
                    {new Date(post.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha - Información principal */}
          <div className="lg:w-3/5 space-y-8">
            {/* Título y precio */}
            <div>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <h1 className="text-3xl md:text-4xl font-bold leading-tight">{post.title}</h1>
                <div className="flex items-center space-x-2">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    ${post.price}
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-gray-800 mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-300">Descripción</h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {post.description}
                </p>
              </div>
            </div>

            {/* Información del vendedor */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Información del Vendedor
              </h2>

              {!seller ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No se pudo cargar la información del vendedor</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Información básica */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold mr-3">
                          {seller.full_name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="text-lg font-semibold">{seller.full_name || "Usuario"}</p>
                          <p className="text-gray-400 text-sm">{seller.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {seller.kyc_verified ? (
                        <div className="flex items-center bg-gradient-to-r from-green-900/30 to-emerald-900/30 text-green-400 px-4 py-2 rounded-full border border-green-800/50">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verificado
                        </div>
                      ) : (
                        <div className="flex items-center bg-gradient-to-r from-red-900/30 to-pink-900/30 text-red-400 px-4 py-2 rounded-full border border-red-800/50">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          No verificado
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rating y reseñas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Rating */}
                    <div className="bg-gray-800/30 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Calificación</h4>
                      <div className="flex items-center">
                        {seller.rating ? (
                          <>
                            <div className="text-2xl font-bold mr-3">{seller.rating.toFixed(1)}</div>
                            {renderStars(seller.rating)}
                          </>
                        ) : (
                          <p className="text-gray-500">Sin calificaciones</p>
                        )}
                      </div>
                    </div>

                    {/* Contacto */}
                    <div className="bg-gray-800/30 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Contacto</h4>
                      <a
                        href={`mailto:${seller.email}`}
                        className="text-blue-400 hover:text-blue-300 transition-colors flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {seller.email}
                      </a>
                    </div>
                  </div>

                  {/* Reseñas */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      Reseñas de compradores ({seller.reviews?.length || 0})
                    </h4>

                    {renderReviews(seller.reviews || [])}
                  </div>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="space-y-4">
              {!post.sold && userId !== post.user_id && (
                <button
                  onClick={handleBuy}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Comprar ahora
                  </div>
                </button>
              )}

              {userId === post.user_id && (
                <div className="space-y-4">
                  <button
                    onClick={() => navigate(`/edit-post/${post.id}`)}
                    className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar publicación
                    </div>
                  </button>

                  {!post.sold && (
                    <button
                      onClick={markAsSold}
                      className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Marcar como vendido
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Marketplace. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default PostDetails;