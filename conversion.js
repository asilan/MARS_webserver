const RADIANS_PER_DEGREE = Math.PI/180.0;
const DEGREES_PER_RADIAN = 180.0/Math.PI;

// WGS84 Parameters
const WGS84_A = 6378137.0;		// major axis
const WGS84_B = 6356752.31424518;	// minor axis
const WGS84_F = 0.0033528107;		// ellipsoid flattening
const WGS84_E = 0.0818191908;		// first eccentricity
const WGS84_EP = 0.0820944379;		// second eccentricity

// UTM Parameters
const UTM_K0 = 0.9996;			// scale factor
const UTM_FE = 500000.0;		// false easting
const UTM_FN_N = 0.0;			// false northing on north hemisphere
const UTM_FN_S = 10000000.0;		// false northing on south hemisphere
const UTM_E2 = (WGS84_E*WGS84_E);	// e^2
const UTM_E4 = (UTM_E2*UTM_E2);		// e^4
const UTM_E6 = (UTM_E4*UTM_E2);		// e^6
const UTM_EP2 = (UTM_E2/(1-UTM_E2));	// e'^2

  
function latLng2utm(lat, lon)
{

/**
 * Utility function to convert geodetic to UTM position
 *
 * Units in are floating point degrees (sign for east/west)
 *
 * Units out are meters
 */
  // constants
  var m0 = (1 - UTM_E2/4 - 3*UTM_E4/64 - 5*UTM_E6/256);
  var m1 = -(3*UTM_E2/8 + 3*UTM_E4/32 + 45*UTM_E6/1024);
  var m2 = (15*UTM_E4/256 + 45*UTM_E6/1024);
  var m3 = -(35*UTM_E6/3072);

  // compute the central meridian
  var cm;
  if (lon>=0.0)
  {
  	cm = Math.floor(lon) - (Math.floor(lon))%6 + 3;
  }
  else
  {
  	cm = - Math.floor(-lon) + (Math.floor(-lon))%6 - 3;
  }

	var zoneNum;
  if (56 <= lat && lat < 64 && 3 <= lon && lon < 12) zoneNum=32;

  if (72 <= lat && lat <= 84 && lon >= 0) {
    if (lon <  9) zoneNum=31;
    if (lon < 21) zoneNum=33;
    if (lon < 33) zoneNum=35;
    if (lon < 42) zoneNum=37;
  }
  zoneNum=Math.floor((lon + 180) / 6) + 1;
  
  // convert degrees into radians
  var rlat = lat * RADIANS_PER_DEGREE;
  var rlon = lon * RADIANS_PER_DEGREE;
  var rlon0 = cm * RADIANS_PER_DEGREE;

  // compute trigonometric functions
  var slat = Math.sin(rlat);
  var clat = Math.cos(rlat);
  var tlat = Math.tan(rlat);

  // decide the false northing at origin
  var fn = (lat > 0) ? UTM_FN_N : UTM_FN_S;

  var T = tlat * tlat;
  var C = UTM_EP2 * clat * clat;
  var A = (rlon - rlon0) * clat;
  var M = WGS84_A * (m0*rlat + m1*Math.sin(2*rlat)
			+ m2*Math.sin(4*rlat) + m3*Math.sin(6*rlat));
  var V = WGS84_A / Math.sqrt(1 - UTM_E2*slat*slat);

  // compute the easting-northing coordinates
  var x = UTM_FE + UTM_K0 * V * (A + (1-T+C)*(A**3)/6
			      + (5-18*T+T*T+72*C-58*UTM_EP2)*(A**5)/120);
  var y = fn + UTM_K0 * (M + V * tlat * (A*A/2
				      + (5-T+9*C+4*C*C)*(A**4)/24
				      + ((61-58*T+T*T+600*C-330*UTM_EP2)
					 * (A**6)/720)));

  return [x,y,zoneNum];
}


function toQuaternion(pitch, roll, yaw)
{
	var w, x, y, z;
        // Abbreviations for the various angular functions
	var cy = Math.cos(yaw * 0.5);
	var sy = Math.sin(yaw * 0.5);
	var cr = Math.cos(roll * 0.5);
	var sr = Math.sin(roll * 0.5);
	var cp = Math.cos(pitch * 0.5);
	var sp = Math.sin(pitch * 0.5);

	w = cy * cr * cp + sy * sr * sp;
	x = cy * sr * cp - sy * cr * sp;
	y = cy * cr * sp + sy * sr * cp;
	z = sy * cr * cp - cy * sr * sp;
	return [w,x,y,z];
}
