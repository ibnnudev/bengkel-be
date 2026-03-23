const KM_RADIUS = 6371;

type distanceParams = {
  lat1: number;
  lon1: number;
  lat2: number;
  lon2: number;
};

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const calculateDistance = ({
  lat1,
  lon1,
  lat2,
  lon2,
}: distanceParams) => {
  const R = KM_RADIUS;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
