"""Face Lock Authentication System for JARVIS."""

import os
from typing import Optional

import numpy as np

from jarvis.core.config import Config, FACE_DATA_DIR


class FaceLock:
    """Biometric face recognition authentication system."""

    def __init__(self, config: Config) -> None:
        self._config = config
        self._known_encoding: Optional[np.ndarray] = None
        self._available = False
        self._init_face_recognition()

    def _init_face_recognition(self) -> None:
        try:
            import importlib.util

            if (
                importlib.util.find_spec("face_recognition") is None
                or importlib.util.find_spec("cv2") is None
            ):
                self._available = False
                return
            self._available = True
            self._load_known_face()
        except ImportError:
            self._available = False

    @property
    def is_available(self) -> bool:
        return self._available

    @property
    def is_enabled(self) -> bool:
        return bool(self._config.get("security.face_lock_enabled", True))

    @property
    def is_configured(self) -> bool:
        encoding_path = FACE_DATA_DIR / "owner_encoding.npy"
        return encoding_path.exists() and self._known_encoding is not None

    def _load_known_face(self) -> None:
        encoding_path = FACE_DATA_DIR / "owner_encoding.npy"
        if encoding_path.exists():
            self._known_encoding = np.load(str(encoding_path))

    def enroll_face(self, num_samples: int = 5) -> bool:
        if not self._available:
            return False

        import cv2
        import face_recognition

        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            return False

        encodings: list[np.ndarray] = []
        samples_collected = 0

        try:
            while samples_collected < num_samples:
                ret, frame = cap.read()
                if not ret:
                    continue

                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                face_locations = face_recognition.face_locations(rgb_frame)

                if len(face_locations) == 1:
                    encoding = face_recognition.face_encodings(
                        rgb_frame, face_locations
                    )
                    if encoding:
                        encodings.append(encoding[0])
                        samples_collected += 1

                cv2.imshow(
                    "JARVIS Face Enrollment",
                    self._draw_face_box(frame, face_locations, samples_collected, num_samples),
                )
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    break
        finally:
            cap.release()
            cv2.destroyAllWindows()

        if len(encodings) < 3:
            return False

        avg_encoding = np.mean(encodings, axis=0)
        FACE_DATA_DIR.mkdir(parents=True, exist_ok=True)
        np.save(str(FACE_DATA_DIR / "owner_encoding.npy"), avg_encoding)
        self._known_encoding = avg_encoding
        return True

    def verify_face(self, timeout_seconds: int = 10) -> bool:
        if not self._available or self._known_encoding is None:
            return False

        import cv2
        import face_recognition
        import time

        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            return False

        start_time = time.time()
        verified = False

        try:
            while time.time() - start_time < timeout_seconds:
                ret, frame = cap.read()
                if not ret:
                    continue

                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                face_locations = face_recognition.face_locations(rgb_frame)
                face_encodings = face_recognition.face_encodings(
                    rgb_frame, face_locations
                )

                for encoding in face_encodings:
                    matches = face_recognition.compare_faces(
                        [self._known_encoding], encoding, tolerance=0.5
                    )
                    face_distance = face_recognition.face_distance(
                        [self._known_encoding], encoding
                    )

                    if matches[0] and face_distance[0] < 0.5:
                        verified = True
                        break

                status = "VERIFIED" if verified else "SCANNING..."
                color = (0, 255, 0) if verified else (0, 165, 255)
                display_frame = self._draw_verification_ui(
                    frame, face_locations, status, color
                )
                cv2.imshow("JARVIS Face Verification", display_frame)

                if verified:
                    cv2.waitKey(1000)
                    break

                if cv2.waitKey(1) & 0xFF == ord("q"):
                    break
        finally:
            cap.release()
            cv2.destroyAllWindows()

        return verified

    def _draw_face_box(
        self,
        frame: np.ndarray,
        face_locations: list[tuple[int, int, int, int]],
        current: int,
        total: int,
    ) -> np.ndarray:
        import cv2

        display = frame.copy()
        for top, right, bottom, left in face_locations:
            cv2.rectangle(display, (left, top), (right, bottom), (0, 255, 255), 2)

        cv2.putText(
            display,
            f"JARVIS ENROLLMENT: {current}/{total}",
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 255, 255),
            2,
        )
        return display

    def _draw_verification_ui(
        self,
        frame: np.ndarray,
        face_locations: list[tuple[int, int, int, int]],
        status: str,
        color: tuple[int, int, int],
    ) -> np.ndarray:
        import cv2

        display = frame.copy()
        for top, right, bottom, left in face_locations:
            cv2.rectangle(display, (left, top), (right, bottom), color, 2)

        cv2.putText(
            display,
            f"JARVIS: {status}",
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            color,
            2,
        )
        return display

    def delete_face_data(self) -> bool:
        encoding_path = FACE_DATA_DIR / "owner_encoding.npy"
        if encoding_path.exists():
            os.remove(str(encoding_path))
            self._known_encoding = None
            return True
        return False
