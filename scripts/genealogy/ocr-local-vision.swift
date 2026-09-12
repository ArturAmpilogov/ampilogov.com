import Foundation
import Vision

guard CommandLine.arguments.count > 1 else {
  fputs("usage: ocr-local-vision.swift IMAGE...\n", stderr)
  exit(2)
}

for path in CommandLine.arguments.dropFirst() {
  autoreleasepool {
    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.recognitionLanguages = ["ru-RU"]
    request.usesLanguageCorrection = false
    let handler = VNImageRequestHandler(url: URL(fileURLWithPath: path), options: [:])
    do {
      try handler.perform([request])
      let observations = (request.results ?? []).sorted {
        if abs($0.boundingBox.midY - $1.boundingBox.midY) > 0.01 {
          return $0.boundingBox.midY > $1.boundingBox.midY
        }
        return $0.boundingBox.minX < $1.boundingBox.minX
      }
      print("@@FILE\t\(path)")
      for observation in observations {
        if let candidate = observation.topCandidates(1).first {
          print(candidate.string)
        }
      }
    } catch {
      print("@@FILE\t\(path)\n@@ERROR\t\(error)")
    }
  }
}
