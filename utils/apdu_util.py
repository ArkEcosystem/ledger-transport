#!/usr/bin/env python3

# /*****************************************************************************
#  * Copyright (c) ARK Ecosystem <info@ark.io>
#  *
#  * The MIT License (MIT)
#  *
#  * Permission is hereby granted, free of charge, to any person obtaining a
#  * copy of this software and associated documentation files (the "Software"),
#  * to deal in the Software without restriction, including without limitation
#  * the rights to use, copy, modify, merge, publish, distribute, sublicense,
#  * and/or sell copies of the Software, and to permit persons to whom the
#  * Software is furnished to do so, subject to the following conditions:
#  *
#  * The above copyright notice and this permission notice shall be included in
#  * all copies or substantial portions of the Software.
#  *
#  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
#  * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
#  * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
#  * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
#  * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
#  * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
#  * OR OTHER DEALINGS IN THE SOFTWARE.
#  ****************************************************************************/

import argparse
import binascii
import math
import struct
import sys

###############################################################################
# This Python3 script can be used to wrap ARK-like transactions and messages for use with the ARK Ledger App's APDU implementation.
#
# example calls:
# - python3 apdu_util.py --message 57686174207765206b6e6f7720697320612064726f702c207768617420776520646f6e2774206b6e6f7720697320616e206f6365616e2e
# - python3 apdu_util.py --message 416c6c2070617274732073686f756c6420676f20746f67657468657220776974686f757420666f7263696e672e20596f75206d7573742072656d656d62657220746861742074686520706172747320796f7520617265207265617373656d626c696e67207765726520646973617373656d626c656420627920796f752e205468657265666f72652c20696620796f752063616e277420676574207468656d20746f67657468657220616761696e2c207468657265206d757374206265206120726561736f6e2e20427920616c6c206d65616e732c20646f206e6f742075736520612068616d6d65722e207e2049424d204d616e75616c202d20283139373529
# - python3 apdu_util.py --tx ff0217010000000000010000000000000003a02b9d5fdd1307c2ee4652ba54d492d1fd11a7d1bb3f3a44c4a05e79f19de933809698000000000000a08601000000000000000000171dfc69b54c7fe901e91d5a9ab78388645e2427ea
# - python3 apdu_util.py --tx ff0217010000000400020000000000000003b593aa66b53525c5399b4af5a4f583dede1c2a46176c6796a7284ee9c0a1167f0094357700000000000210037eaa8cb236c40a08fcb9d6220743ee6ae1b5c40e8a77a38f286516c3ff6639010301fd417566397113ba8c55de2f093a572744ed1829b37b56a129058000ef7bce0209d3c0f68994253cee24b23df3266ba1f0ca2f0666cd69a46544d63001cdf150037eaa8cb236c40a08fcb9d6220743ee6ae1b5c40e8a77a38f286516c3ff6639010301fd417566397113ba8c55de2f093a572744ed1829b37b56a129058000ef7bce0209d3c0f68994253cee24b23df3266ba1f0ca2f0666cd69a46544d63001cdf150037eaa8cb236c40a08fcb9d6220743ee6ae1b5c40e8a77a38f286516c3ff6639010301fd417566397113ba8c55de2f093a572744ed1829b37b56a129058000ef7bce0209d3c0f68994253cee24b23df3266ba1f0ca2f0666cd69a46544d63001cdf150037eaa8cb236c40a08fcb9d6220743ee6ae1b5c40e8a77a38f286516c3ff6639010301fd417566397113ba8c55de2f093a572744ed1829b37b56a129058000ef7bce0209d3c0f68994253cee24b23df3266ba1f0ca2f0666cd69a46544d63001cdf150037eaa8cb236c40a08fcb9d6220743ee6ae1b5c40e8a77a38f286516c3ff663901037eaa8cb236c40a08fcb9d6220743ee6ae1b5c40e8a77a38f286516c3ff6639010301fd417566397113ba8c55de2f093a572744ed1829b37b56a129058000ef7bce0209d3c0f68994253cee24b23df3266ba1f0ca2f0666cd69a46544d63001cdf150004495d593cfb8be3293e2473acf504870d2dcf71dbee7620270e136ed63c5eef259099d225f7866178968f0c3581509d92d902914674c8f86b99eb55aaa97586e0171d86f3f6552b237dd81272a7b0da7718c4d26682255223dcf1928174082ce72b07218162938c674afe741119650135338eb3da159e0626ddab6b7851882e08b02d44d9bde77c9ea02d3516ab3263a77f4f9fbb90c30b47eba7a8bb87325edeb78dd69f914f28426e6ff661c4bc001f253130f4e7eb092a9131c8ca69dbfaff32f034495d593cfb8be3293e2473acf504870d2dcf71dbee7620270e136ed63c5eef259099d225f7866178968f0c3581509d92d902914674c8f86b99eb55aaa97586e0471d86f3f6552b237dd81272a7b0da7718c4d26682255223dcf1928174082ce72b07218162938c674afe741119650135338eb3da159e0626ddab6b7851882e08b05d44d9bde77c9ea02d3516ab3263a77f4f9fbb90c30b47eba7a8bb87325edeb78dd69f914f28426e6ff661c4bc001f253130f4e7eb092a9131c8ca69dbfaff32f064495d593cfb8be3293e2473acf504870d2dcf71dbee7620270e136ed63c5eef259099d225f7866178968f0c3581509d92d902914674c8f86b99eb55aaa97586e0771d86f3f6552b237dd81272a7b0da7718c4d26682255223dcf1928174082ce72b07218162938c674afe741119650135338eb3da159e0626ddab6b7851882e08b08d44d9bde77c9ea02d3516ab3263a77f4f9fbb90c30b47eba7a8bb87325edeb78dd69f914f28426e6ff661c4bc001f253130f4e7eb092a9131c8ca69dbfaff32f094495d593cfb8be3293e2473acf504870d2dcf71dbee7620270e136ed63c5eef259099d225f7866178968f0c3581509d92d902914674c8f86b99eb55aaa97586e0a71d86f3f6552b237dd81272a7b0da7718c4d26682255223dcf1928174082ce72b07218162938c674afe741119650135338eb3da159e0626ddab6b7851882e08b0bd44d9bde77c9ea02d3516ab3263a77f4f9fbb90c30b47eba7a8bb87325edeb78dd69f914f28426e6ff661c4bc001f253130f4e7eb092a9131c8ca69dbfaff32f0c4495d593cfb8be3293e2473acf504870d2dcf71dbee7620270e136ed63c5eef259099d225f7866178968f0c3581509d92d902914674c8f86b99eb55aaa97586e0d4495d593cfb8be3293e2473acf504870d2dcf71dbee7620270e136ed63c5eef259099d225f7866178968f0c3581509d92d902914674c8f86b99eb55aaa97586e0e71d86f3f6552b237dd81272a7b0da7718c4d26682255223dcf1928174082ce72b07218162938c674afe741119650135338eb3da159e0626ddab6b7851882e08b0fd44d9bde77c9ea02d3516ab3263a77f4f9fbb90c30b47eba7a8bb87325edeb78dd69f914f28426e6ff661c4bc001f253130f4e7eb092a9131c8ca69dbfaff32f
# - python3 apdu_util.py --publicKey
# - python3 apdu_util.py --publicKey --path "44'/111'/0'/0/0"
# - python3 apdu_util.py --extPublicKey
# - python3 apdu_util.py --extPublicKey --path "44'/111'/0'/0/0"
###############################################################################


###############################################################################
# Constants
###############################################################################

##################################################
# APDU Limits

CHUNK_SIZE = 255
CHUNK_MAX = 10
PAYLOAD_MAX = CHUNK_MAX * CHUNK_SIZE

##################################################
# Path Defaults

# BIP-32 Path: default ARK Devnet
DEFAULT_PATH = "44'/1'/0'/0/0"

##################################################
# APDU Constants

# Instruction Class
CLA = "e0"

# Instructions
INS_PUBKEY = "02"
INS_TX = "04"
INS_MSG = "08"

# PublicKey APDU P1 & P2
P1_NON_CONFIRM = "00"
P2_NO_CHAINCODE = "00"
P2_USE_CHAINCODE = "01"

# Signing APDU P1
P1_SINGLE = "80"
P1_FIRST = "00"
P1_MORE = "01"
P1_LAST = "81"

# Signing Flags P2
P2_SCHNORR_LEG = "50"
###############################################################################


###############################################################################
# Argument Parser
###############################################################################

##################################################
# Parser Setup
parser = argparse.ArgumentParser()
parser.add_argument(
    '--message',
    help="Serializes a hex-encoded message"
)
parser.add_argument(
    '--tx',
    help="Serializes a hex-encoded transaction"
)
parser.add_argument(
    '--path',
    help="Specifies the BIP-32 signing path (default: ARK Devnet)"
)
parser.add_argument(
    '--publicKey',
    help="Creates a publicKey request (may be combined with the '--path' argument)",
    action='store_true'
)
parser.add_argument(
    '--extPublicKey',
    help="Creates an ext. publicKey request (may be combined with the '--path' argument)",
    action='store_true'
)
args, unknown = parser.parse_known_args()

##################################################
# Check Parser Arguments
if args.message is None \
    and args.tx is None \
    and args.publicKey is False \
    and args.extPublicKey is False:
    print(
        "\n===================================\n",
        "WARNING: No Fixture Type selected!\n\n"
    )
    parser.print_help()
    print(
        "\n\nNow Exiting...",
        "\n===================================\n"
    )
    sys.exit()

##################################################
# Set Path Argument
if args.path is None:
    args.path = DEFAULT_PATH
###############################################################################


###############################################################################
# Functions
###############################################################################

##################################################
# Packs the BIP-32 Path into a Uint-16 Array
def pack_bip32_path(path_):
    if len(path_) == 0:
        return b""
    result = b""
    elements = path_.split('/')
    for level in elements:
        element = level.split('\'')
        if len(element) == 1:
            result = result + struct.pack(">I", int(element[0]))
        else:
            result = result + struct.pack(">I", 0x80000000 | int(element[0]))
    return result

##################################################
# chunk_apdu_payload
#
# Splits an APDU payload into chunks
#
# - payload_:       the payload to be split
# - chunks_:        the destination for the split payload
# - chunk_count_:    how many chunks the payload should be split into
# - chunk_size_:     max chunk size
# - path_length_:    the length of the bip32 path
#
# ---
def chunk_apdu_payload(payload_, chunks_, chunk_count_, chunk_size_, path_length_):
    for i in range(chunk_count_):
        pos = (0 if i == 0 else i * chunk_size_ - path_length_)
        end = (i + 1) * chunk_size_ - path_length_
        if i < chunk_count_:
            chunks_[i] = payload_[pos:end]
        else:
            chunks_[i] = payload_[pos:]

##################################################
# Prints a PublicKey Request Payload on a given BIP-32 signing path then exits
#
# - packed_path_:   the packed BIP-32 path
# - path_length_:   the length of the bip32 path
# - cla_:           the instruction class
# - p1_:            whether or not to ask for user confirmation on-device
# - use_chaincode:  whether or not to request an extended publicKey
#
# ---
def print_publickey(
    packed_path_,
    path_length_,
    cla_,
    p1_,
    use_chaincode,
    ):
    try:
        apdu = bytearray.fromhex(
            cla_
            + INS_PUBKEY
            + p1_
            + ((P2_USE_CHAINCODE if use_chaincode else P2_NO_CHAINCODE))
        )
        apdu.append(path_length_)
        apdu.append(path_length_ // 4)
        apdu += packed_path_
        print (
            '\nPublicKey Request Payload:\n',
            binascii.hexlify(bytes(apdu)).decode('utf-8'), '\n'
        )
    except Exception as e: print(e)
    sys.exit()

##################################################
# print_apdu
#
# Prints the APDU payload in segmented chunks
#
# - chunks_:        the segmented payload buffer
# - chunk_count_:   the payload segment count
# - cla_:           the instruction class
# - p1_:            the payload segment identifier
# - p2_:            the signing algo or chaincode identifier
# - path_:          the packed BIP-32 path
# - path_len_:      the length of the packed BIP-32 path
#
# ---
def print_apdu(chunks_, chunk_count_, cla_, instruction_, p1_, p2_, path_, path_len_):
    for i in range(chunk_count_):
        if chunks_[i] is not None:
            has_more_chunks = chunks_[i + 1] is not None
            p1 = P1_SINGLE if chunk_count_ == 1               \
                else P1_FIRST if i == 0 and has_more_chunks   \
                else P1_MORE if has_more_chunks else P1_LAST
            apdu = bytearray.fromhex(cla_ + instruction_ + p1_ + p2_)

            if i == 0:
                apdu.append(path_len_ + len(chunks_[0]))
                apdu.append(path_len_ // 4)
                apdu += path_ + chunks_[0]
            else:
                apdu.append(len(chunks_[i]))
                apdu += chunks_[i]

            result = bytes(apdu)
            apdu.append(len(chunks_[i]))
            apdu += chunks_[i]
            print (
                f'\nPayload Chunk {i + 1} of {chunk_count_}:\n',
                binascii.hexlify(bytes(apdu)).decode('utf-8'), '\n',
            )
###############################################################################


###############################################################################
# Application
###############################################################################

##################################################
# Pack the BIP-32 Path
bip32_path = pack_bip32_path(args.path)

# Determine the BIP-32 path's length
path_length = len(bip32_path) + 1


##################################################
# Print the payload if this is a PublicKey request and exit
if args.publicKey is True:
    print_publickey(bip32_path, path_length, CLA, P1_NON_CONFIRM, False)

# Print the payload if this is an Ext. PublicKey request and exit
if args.extPublicKey is True:
    print_publickey(bip32_path, path_length, CLA, P1_NON_CONFIRM, True)


##################################################
# Set the Transaction or Message payload
if args.tx is not None:
    payload = bytearray.fromhex(args.tx)
    instruction = INS_TX
elif args.message is not None:
    payload = binascii.unhexlify(args.message)
    instruction = INS_MSG
else:
    print ('\nInvalid Payload Instruction\n')
    sys.exit()


##################################################
# Determine the payload's length
payload_len = len(payload)

# Check the payload's length
if payload_len > PAYLOAD_MAX:
    print (f'\nPayload length ({payload_len}) exceeds max of {PAYLOAD_MAX}')
    sys.exit()


##################################################
# Determine the chunk count
chunk_count = math.floor(payload_len / CHUNK_SIZE) + 1

# Check the chunk count
if chunk_count > CHUNK_MAX:
    print (f'\nPayload chunk count ({chunk_count}) exceeds max of {CHUNK_MAX}')
    sys.exit()


##################################################
# Create the chunk buffer
chunks = [None] * (CHUNK_MAX + 1)

# Chunk the payload
chunk_apdu_payload(payload, chunks, chunk_count, CHUNK_SIZE, path_length)


##################################################
# Set p1
p1 = (P1_SINGLE if chunk_count == 1 else P1_FIRST)

# Set p2 (Signing Algorithm: Schnorr)
p2 = P2_SCHNORR_LEG


##################################################
# Print the APDU Payload in Segmented Chunks
print_apdu(chunks, chunk_count, CLA, instruction, p1, p2, bip32_path, path_length)


##################################################
# Exit the application
sys.exit()
