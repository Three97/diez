// This file was generated with Diez - https://diez.org
// Do not edit this file directly.

import Foundation
import CoreGraphics
@objc(DEZFont)
public final class Font: NSObject, Decodable {
    /**
    Font data.
    */
    @objc public internal(set) var file: File
    /**
    Font data.
    */
    @objc public internal(set) var name: String

    init(
        file: File,
        name: String
    ) {
        self.file = file
        self.name = name
    }
}

extension Font: ReflectedCustomStringConvertible {
    public override var description: String {
        return reflectedDescription
    }
}