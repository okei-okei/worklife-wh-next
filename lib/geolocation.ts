export type UserCoordinates = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

export type GeolocationFailureReason =
  | "unsupported"
  | "insecure_context"
  | "permission_denied"
  | "position_unavailable"
  | "timeout"
  | "unknown";

export type GeolocationFailure = {
  reason: GeolocationFailureReason;
};

function isLocalDevelopmentHost() {
  if (typeof window === "undefined") return false;

  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}

function toFailure(reason: GeolocationFailureReason): GeolocationFailure {
  return { reason };
}

export function isGeolocationFailure(
  error: unknown,
): error is GeolocationFailure {
  return (
    typeof error === "object" &&
    error !== null &&
    "reason" in error &&
    typeof (error as GeolocationFailure).reason === "string"
  );
}

export function getGeolocationFailureMessage(
  error: unknown,
): string {
  const reason = isGeolocationFailure(error) ? error.reason : "unknown";

  switch (reason) {
    case "unsupported":
      return "このブラウザでは現在地を取得できません。";
    case "insecure_context":
      return "現在地を取得するにはHTTPSでページを開いてください。";
    case "permission_denied":
      return "現在地の利用が許可されていません。ブラウザのサイト設定から位置情報を許可してください。iPhoneでは「設定」→「プライバシーとセキュリティ」→「位置情報サービス」もご確認ください。";
    case "position_unavailable":
      return "現在地を確認できませんでした。屋外や電波の良い場所で、もう一度お試しください。";
    case "timeout":
      return "現在地の取得に時間がかかっています。通信状況を確認して、もう一度お試しください。";
    default:
      return "現在地を取得できませんでした。しばらくしてからもう一度お試しください。";
  }
}

async function getPermissionState() {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) {
    return null;
  }

  try {
    const status = await navigator.permissions.query({
      name: "geolocation" as PermissionName,
    });
    return status.state;
  } catch {
    return null;
  }
}

export async function getCurrentLocation(): Promise<UserCoordinates> {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    throw toFailure("unsupported");
  }

  if (!window.isSecureContext && !isLocalDevelopmentHost()) {
    throw toFailure("insecure_context");
  }

  if (!("geolocation" in navigator)) {
    throw toFailure("unsupported");
  }

  const permissionState = await getPermissionState();
  if (permissionState === "denied") {
    throw toFailure("permission_denied");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accuracy = Number.isFinite(position.coords.accuracy)
          ? position.coords.accuracy
          : null;

        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(toFailure("permission_denied"));
            return;
          case error.POSITION_UNAVAILABLE:
            reject(toFailure("position_unavailable"));
            return;
          case error.TIMEOUT:
            reject(toFailure("timeout"));
            return;
          default:
            reject(toFailure("unknown"));
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 12000,
        maximumAge: 60000,
      },
    );
  });
}
