/* Verifizierte Pexels-Fotos — glueckliche Paare, KEIN Hochzeitskontext. */
const px = (id: number, w = 1000) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const IMG = {
  hero: px(31558934, 1200),
  founder: px(8528876, 1000),
  a1: px(34409906, 400),
  a2: px(8554867, 400),
  a3: px(5859639, 400),
  g1: px(31558934, 800),
  g2: px(34409906, 800),
  g3: px(32439850, 800),
  g4: px(5859639, 800),
};
