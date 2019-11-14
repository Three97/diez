// This file was generated with Diez - https://diez.org
// Do not edit this file directly.

import Foundation
import CoreGraphics
@objc(DEZFill)
public final class Fill: NSObject, Decodable {
    /**
    Fill data.
    */
    @objc public internal(set) var color: Color
    /**
    Fill data.
    */
    @objc public internal(set) var linearGradient: LinearGradient
    /**
    Fill data.
    */
    @objc public internal(set) var type: String

    init(
        color: Color,
        linearGradient: LinearGradient,
        type: String
    ) {
        self.color = color
        self.linearGradient = linearGradient
        self.type = type
    }
}

extension Fill: ReflectedCustomStringConvertible {
    public override var description: String {
        return reflectedDescription
    }
}