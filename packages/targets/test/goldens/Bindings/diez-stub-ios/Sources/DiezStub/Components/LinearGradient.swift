import Foundation
import CoreGraphics

@objc(DEZLinearGradient)
public final class LinearGradient: NSObject, Decodable {
    @objc public internal(set) var stops: [GradientStop]
    @objc public internal(set) var start: Point2D
    @objc public internal(set) var end: Point2D

    init(
        stops: [GradientStop],
        start: Point2D,
        end: Point2D
    ) {
        self.stops = stops
        self.start = start
        self.end = end
    }
}

extension LinearGradient: ReflectedCustomStringConvertible {
    public override var description: String {
        return reflectedDescription
    }
}
