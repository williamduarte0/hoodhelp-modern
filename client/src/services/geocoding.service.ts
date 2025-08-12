interface GeocodeResponse {
  statename: string;
  standard: {
    addresst: string;
    staddress: string;
    stnumber: string;
    statename: string;
    inlatt: string;
    distance: string;
    region: string;
    postal: string;
    prov: string;
    city: string;
    countryname: string;
    confidence: string;
    class: any;
    inlongt: string;
  };
  distance: string;
  elevation: string;
  state: string;
  latt: string;
  city: string;
  prov: string;
  country: string;
  stnumber: string;
  staddress: string;
  inlatt: string;
  longt: string;
  region: string;
  postal: string;
  confidence: string;
  timezone: string;
}

export const geocodingService = {

  getAddressFromCoordinates: async (
    latitude: number,
    longitude: number
  ): Promise<string> => {
    try {
      const response = await fetch(
        `https://geocode.xyz/${latitude},${longitude}?geoit=json`
      );

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data: GeocodeResponse = await response.json();

      if (!data.standard || !data.standard.city) {
        throw new Error("Invalid geocoding response");
      }

      const addressParts = [];

      if (data.standard.stnumber && data.standard.staddress) {
        addressParts.push(
          `${data.standard.stnumber} ${data.standard.staddress}`
        );
      } else if (data.standard.staddress) {
        addressParts.push(data.standard.staddress);
      }

      if (data.standard.city) {
        addressParts.push(data.standard.city);
      }

      if (
        data.standard.statename &&
        data.standard.statename !== data.standard.city
      ) {
        addressParts.push(data.standard.statename);
      }

      if (data.standard.postal) {
        addressParts.push(data.standard.postal);
      }

      if (data.standard.countryname) {
        addressParts.push(data.standard.countryname);
      }

      return addressParts.join(", ");
    } catch (error) {
      console.error("Error getting address from coordinates:", error);

      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  },


  getDetailedLocation: async (
    latitude: number,
    longitude: number
  ): Promise<{
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    confidence: number;
  }> => {
    try {
      const response = await fetch(
        `https://geocode.xyz/${latitude},${longitude}?geoit=json`
      );

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data: GeocodeResponse = await response.json();

      if (!data.standard || !data.standard.city) {
        throw new Error("Invalid geocoding response");
      }

      return {
        address:
          data.standard.stnumber && data.standard.staddress
            ? `${data.standard.stnumber} ${data.standard.staddress}`
            : data.standard.staddress || "",
        city: data.standard.city || "",
        state: data.standard.statename || data.state || "",
        country: data.standard.countryname || data.country || "",
        postalCode: data.standard.postal || "",
        confidence: parseFloat(data.standard.confidence) || 0,
      };
    } catch (error) {
      console.error("Error getting detailed location:", error);

      return {
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        city: "",
        state: "",
        country: "",
        postalCode: "",
        confidence: 0,
      };
    }
  },
};
