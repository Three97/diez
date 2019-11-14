// This file was generated with Diez - https://diez.org
// Do not edit this file directly.

import Foundation
import CoreGraphics
@objc(DEZGradientStop)
public final class GradientStop: NSObject, Decodable {
    /**
    GradientStop data.
    */
    @objc public internal(set) var position: CGFloat
    /**
    GradientStop data.
    */
    @objc public internal(set) var color: Color

    init(
        position: CGFloat,
        color: Color
    ) {
        self.position = position
        self.color = color
    }
}

extension GradientStop: ReflectedCustomStringConvertible {
    public override var description: String {
        return reflectedDescription
    }
}