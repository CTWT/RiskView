declare global {
    namespace kakao.maps {
        function load(callback: () => void): void;
        class Map {
            constructor(container: HTMLElement | string, options: MapOptions);
            setCenter(latlng: LatLng): void;
            getCenter(): LatLng;
            setLevel(level: number): void;
            getLevel(): number;
            panTo(latlng: LatLng): void;
        }

        interface MapOptions {
            center: LatLng;
            level?: number; // 기본: 3
            draggable?: boolean;
            scrollwheel?: boolean;
            disableDoubleClick?: boolean;
            disableDoubleClickZoom?: boolean;
            projectionId?: number;
            tileAnimation?: boolean;
            keyboardShortcuts?: boolean | { speed?: number };
        }

        class LatLng {
            constructor(lat: number, lng: number);
            getLat(): number;
            getLng(): number;
        }

        class Marker {
            constructor(options: MarkerOptions);
            setMap(map: Map | null): void;
            getMap(): Map | null;
        }

        interface MarkerOptions {
            map?: Map;
            position: LatLng;
            title?: string;
            image?: MarkerImage;
            clickable?: boolean;
            draggable?: boolean;
            opacity?: number;
        }

        class MarkerImage {
            constructor(src: string, size: Size, options?: MarkerImageOptions);
        }

        interface MarkerImageOptions {
            offset?: Point;
            alt?: string;
            shape?: string;
            coords?: string;
        }

        class Size {
            constructor(width: number, height: number);
        }

        class Point {
            constructor(x: number, y: number);
        }

        class Circle {
            constructor(options: CircleOptions);
            setMap(map: Map | null): void;
            getMap(): Map | null;
            setCenter(latlng: LatLng): void;
            setRadius(radius: number): void;
        }

        interface CircleOptions {
            map?: Map;
            center: LatLng;
            radius: number;
            strokeWeight?: number;
            strokeColor?: string;
            strokeOpacity?: number;
            strokeStyle?: 'solid' | 'shortdash' | 'shortdot' | 'shortdashdot' | 'dash' | 'dot' | 'dashdot';
            fillColor?: string;
            fillOpacity?: number;
        }

        namespace event {
            function addListener<T extends keyof MapEventType>(
                target: Map,
                type: T,
                handler: MapEventType[T]
            ): void;
        }

        interface MapEventType {
            click: (mouseEvent: MouseEvent) => void;
            center_changed: () => void;
            zoom_changed: () => void;
        }
    }

    interface Window {
        kakao: {
            maps: typeof kakao.maps;
        };
    }
}

export {};