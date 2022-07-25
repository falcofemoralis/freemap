export interface WikimapiaLatLng {
  lat: number;
  lng: number;
}

export interface WikimapiaFeature {
  id: number;
  area: number;
  mbr: any;
  zoom: number;
  encodingType: number;
  polygon: WikimapiaLatLng[];
  titles: any;
  count: number;
}

export interface WikimapiaData {
  tileId: string;
  deeperTiles: boolean;
  numTypes: number;
  ids: [number];
  features: WikimapiaFeature[];
}

export enum TileTypes {
  OBJECTS = 'objects',
  ROADS = 'roads',
}

export class WikimapiaApi {
  static LatLng = function (t, e) {
    return { lat: +t, lng: +e };
  };

  static Polygon = function (t) {
    const extendBounds = function (bounds, t) {
      let e = null;

      if (t) {
        // if (t instanceof s) {
        e = WikimapiaApi.Bounds({
          left: t.lng,
          bottom: t.lat,
          right: t.lng,
          top: t.lat,
        });
        // }
        // if (t instanceof n) {
        //   e = WikimapiaApi.Bounds({
        //     left: t.x,
        //     bottom: t.y,
        //     right: t.x,
        //     top: t.y,
        //   });
        // }
        if (t instanceof WikimapiaApi.Bounds) {
          e = t;
        }
        if (e) {
          bounds.centerLatLng = null;
          if (!bounds.left || e.left < bounds.left) {
            bounds.left = e.left;
          }
          if (!bounds.bottom || e.bottom < bounds.bottom) {
            bounds.bottom = e.bottom;
          }
          if (!bounds.right || e.right > bounds.right) {
            bounds.right = e.right;
          }
          if (!bounds.top || e.top > bounds.top) {
            bounds.top = e.top;
          }
        }
      }
      return bounds;
    };

    const calculateBounds = function (points) {
      let bounds = null;
      if (points && points.length > 0) {
        for (let t = 0, e = points.length; t < e; t++) {
          if (bounds === null) {
            bounds = WikimapiaApi.Bounds({
              left: points[t].lng,
              top: points[t].lat,
              bottom: points[t].lat,
              right: points[t].lng,
            });
          } else {
            bounds = extendBounds(bounds, points[t]);
          }
        }
      }

      return bounds;
    };

    //Wikimapia.Geometry.call(this, t);
    let points = [];
    if (t) {
      points = t;
    }
    return calculateBounds(points);
  };

  static decodePolygonMK2 = function (t) {
    const e = t.length;
    const a = [];
    let i = 0;
    let o = 0;
    let n = 0;
    let s: any = false;

    while (i < e) {
      let p;
      let l = 0;
      let c = 0;

      do {
        p = t.charCodeAt(i++) - 63;
        c |= (p & 31) << l;
        l += 5;
      } while (p >= 32);
      n += c & 1 ? ~(c >> 1) : c >> 1;
      if (n > 180 * 1e6 || n < -(180 * 1e6)) {
        s = true;
      }
      l = 0;
      c = 0;
      do {
        p = t.charCodeAt(i++) - 63;
        c |= (p & 31) << l;
        l += 5;
      } while (p >= 32);
      o += c & 1 ? ~(c >> 1) : c >> 1;
      s = o > 90 * 1e6 || o < -(90 * 1e6) ? 1e7 : 1e6;
      a.push(WikimapiaApi.LatLng(o / s, n / s));
    }
    // return WikimapiaApi.Polygon(a);
    return a;
  };

  static decodeObjectPolygon = function (t) {
    if (typeof t.polygon === 'string') {
      t.polygon = t.encodingType === 1 ? WikimapiaApi.decodePolygonMK2(t.polygon) : '';
    }
    return t.polygon;
  };

  static decodeTitles = function (t) {
    const e = {};
    t = t.split('');
    for (let i = 0, a = t.length; i < a; i++) {
      if (typeof t[i] === 'string') {
        e[(t[i].charCodeAt(0) - 32).toString()] = t[i].substring(1, t[i].length);
      }
    }
    return e;
  };

  static Bounds = function (t) {
    t = t || {};
    const bounds: any = {};
    bounds.left = !!t.left ? parseFloat(t.left) : 0;
    bounds.bottom = !!t.bottom ? parseFloat(t.bottom) : 0;
    bounds.right = !!t.right ? parseFloat(t.right) : 0;
    bounds.top = !!t.top ? parseFloat(t.top) : 0;
    return bounds;
  };

  static parse = function (t): WikimapiaData {
    const c: any = {};
    let a, o, s, r, p, l;
    //i = i || this.layer.tileCache.objects;
    t = t.split('\n');
    a = t[0].split('|');
    c.tileId = a[0];
    c.deeperTiles = !!parseInt(a[1]);
    c.numTypes = parseInt(a[2], 10);
    c.ids = [];
    c.features = [];

    for (let h = 1, u = t.length; h < u; h++) {
      const n: any = {};

      a = t[h].split('|');
      if (a.length > 1) {
        s = a[2].split(',');
        l = a[0];
        if (a[6] == '1') {
          a[7] = a.slice(7).join('|');
        }
        //n = this.pool.get();
        n.id = parseInt(l, 10);
        n.area = parseFloat(a[1]);
        n.mbr = WikimapiaApi.Bounds({
          bottom: parseInt(s[2], 10) / 1e7,
          left: parseInt(s[0], 10) / 1e7,
          top: parseInt(s[3], 10) / 1e7,
          right: parseInt(s[1], 10) / 1e7,
        });
        n.zoom = parseInt(a[3], 10);
        n.encodingType = parseInt(a[6], 10);
        n.polygon = a[7];
        n.titles = WikimapiaApi.decodeTitles(a[5]);
        n.count = 0;
        // if (l in i) {
        //   n.count = i[l].count ? i[l].count + 1 : 2;
        // }
        // i[l] = n;
        c.ids.push(l);
        WikimapiaApi.decodeObjectPolygon(n);
        c.features.push(n);
      }
    }
    return c;
  };

  static getTileUrl = function (t, e, i, a, hash) {
    // Wikimapia.Tile.Itile.prototype.load
    const getQuadKey = function (t, e, i, a) {
      const o = [
        [-2, 1],
        [0, 2],
        [2, 3],
      ][a - 8];
      let n = '0';
      let s;
      t = Math.round(t);
      e = Math.round((1 << (i - o[0])) - e - 1);
      i -= o[1];
      while (i >= 0) {
        s = 1 << i;
        n += ((t & s) > 0 ? 1 : 0) + ((e & s) > 0 ? 2 : 0);
        i--;
      }
      return n;
    };

    const toQuadKey = function (t, e, i) {
      const tileSize = { h: 256, w: 256 };
      const tileFactor = Math.log(tileSize.w) / Math.LN2;
      return getQuadKey(t, e, i, 10);
    };

    // url: "http://i{picserver}.wikimapia.org/?x={x}&y={y}&zoom={zoom}&r={random}&type={type}&lng={lng}"
    let o = 'http://wikimapia.org/z1/itiles';
    if (a === TileTypes.ROADS) {
      o = 'http://wikimapia.org/z1/iroads';
    }
    const k = {
      tileID: toQuadKey(t, e, i).replace(/(\d{3})(?!$)/g, '$1/'),
      hash,
    };

    return `${o}/${k.tileID}.xy?${k.hash}`;
  };

  static fromLatLngToPixel = function (t, z) {
    const i = WikimapiaApi.getOrigins()[z];
    const a = Math.round(i.x + t.lng * WikimapiaApi.getPixelsPerLngDegree()[z]);
    const o = Math.sin(t.lat * (Math.PI / 180));
    const n = Math.round(i.y + 0.5 * Math.log((1 + o) / (1 - o)) * -WikimapiaApi.getPixelsPerLngRadian()[z]);
    return { x: a, y: n };
  };

  static convertCoordinates = function (e, t, z) {
    const i = WikimapiaApi.fromLatLngToPixel(t, z); //  lat: t.top, lng: t.left
    const a = { h: 256, w: 256 };

    //(n = this.dragObject.position),
    const p = WikimapiaApi.Bounds({
      left: Math.floor(i.x / a.w - 0),
      top: Math.floor(i.y / a.h - 0),
      right: Math.ceil((i.x + e.w) / a.w + 0),
      bottom: Math.ceil((i.y + e.h) / a.h + 0),
    });

    // const startTile = {x: p.left, y: p.top};
    // o.offset = new Wikimapia.Point(o.startTile.x * a.w - i.x - n.x, o.startTile.y * a.w - i.y - n.y);
    // o.rows = p.bottom - p.top;
    // o.cols = p.right - p.left;
    //this.loadTiles(p);
    return { x: p.left, y: p.top };
    //this.removeRedundantTiles(p);
  };

  static getOrigins = function () {
    return [
      {
        x: 128,
        y: 128,
      },
      {
        x: 256,
        y: 256,
      },
      {
        x: 512,
        y: 512,
      },
      {
        x: 1024,
        y: 1024,
      },
      {
        x: 2048,
        y: 2048,
      },
      {
        x: 4096,
        y: 4096,
      },
      {
        x: 8192,
        y: 8192,
      },
      {
        x: 16384,
        y: 16384,
      },
      {
        x: 32768,
        y: 32768,
      },
      {
        x: 65536,
        y: 65536,
      },
      {
        x: 131072,
        y: 131072,
      },
      {
        x: 262144,
        y: 262144,
      },
      {
        x: 524288,
        y: 524288,
      },
      {
        x: 1048576,
        y: 1048576,
      },
      {
        x: 2097152,
        y: 2097152,
      },
      {
        x: 4194304,
        y: 4194304,
      },
      {
        x: 8388608,
        y: 8388608,
      },
      {
        x: 16777216,
        y: 16777216,
      },
      {
        x: 33554432,
        y: 33554432,
      },
      {
        x: 67108864,
        y: 67108864,
      },
      {
        x: 134217728,
        y: 134217728,
      },
      {
        x: 268435456,
        y: 268435456,
      },
      {
        x: 536870912,
        y: 536870912,
      },
    ];
  };

  static getPixelsPerLngDegree = function () {
    return [
      0.7111111111111111, 1.4222222222222223, 2.8444444444444446, 5.688888888888889, 11.377777777777778, 22.755555555555556, 45.51111111111111, 91.02222222222223, 182.04444444444445, 364.0888888888889, 728.1777777777778,
      1456.3555555555556, 2912.711111111111, 5825.422222222222, 11650.844444444445, 23301.68888888889, 46603.37777777778, 93206.75555555556, 186413.51111111112, 372827.02222222224, 745654.0444444445, 1491308.088888889,
      2982616.177777778,
    ];
  };

  static getPixelsPerLngRadian = function () {
    return [
      40.74366543152521, 81.48733086305042, 162.97466172610083, 325.94932345220167, 651.8986469044033, 1303.7972938088067, 2607.5945876176133, 5215.189175235227, 10430.378350470453, 20860.756700940907, 41721.51340188181,
      83443.02680376363, 166886.05360752725, 333772.1072150545, 667544.214430109, 1335088.428860218, 2670176.857720436, 5340353.715440872, 10680707.430881744, 21361414.86176349, 42722829.72352698, 85445659.44705395,
      170891318.8941079,
    ];
  };
}
